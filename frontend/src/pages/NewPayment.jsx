import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';

const NewPayment = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Form state
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [farmerOptions, setFarmerOptions] = useState([]);
  const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [totalKgs, setTotalKgs] = useState(0);
  const [deliveryIds, setDeliveryIds] = useState([]);
  
  const [pricePerKg, setPricePerKg] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('Ksh');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search farmers with debounce
  const searchFarmers = async (query) => {
    if (!query || query.length < 2) {
      setFarmerOptions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoadingFarmers(true);
    setShowDropdown(true);
    
    try {
      const response = await api.get(`/farmers/search?q=${query}`);
      setFarmerOptions(response.data);
    } catch (err) {
      console.error('Farmer search failed:', err);
      toast.error('Failed to search farmers');
    } finally {
      setIsLoadingFarmers(false);
    }
  };

  // Handle search input with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchFarmers(value);
    }, 300);
  };

  // Handle farmer selection
  const handleFarmerSelect = async (farmer) => {
    setSelectedFarmer(farmer);
    setSearchQuery(`${farmer.name} (${farmer.cellNumber})`);
    setShowDropdown(false);
    
    // Reset dependent fields
    setAvailableTypes([]);
    setSelectedType('');
    setTotalKgs(0);
    setDeliveryIds([]);
    setPricePerKg('');
    setTotalAmount(0);

    if (!farmer) return;

    try {
      // Fetch available delivery types for this farmer
      const response = await api.get(`/deliveries/types/${farmer._id}`);
      setAvailableTypes(response.data);
      
      if (response.data.length === 0) {
        toast.info('No unpaid deliveries found for this farmer');
      }
    } catch (err) {
      console.error('Failed to fetch delivery types:', err);
      toast.error('No pending deliveries found for this farmer');
    }
  };

  // Handle delivery type selection
  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);
    
    // Reset dependent fields
    setTotalKgs(0);
    setDeliveryIds([]);
    setPricePerKg('');
    setTotalAmount(0);

    if (!type || !selectedFarmer) return;

    try {
      // Fetch total kgs for this farmer and type
      const response = await api.get(`/deliveries/total/${selectedFarmer._id}/${type}`);
      setTotalKgs(response.data.totalKgs || 0);
      setDeliveryIds(response.data.deliveryIds || []);
    } catch (err) {
      console.error('Failed to fetch total kgs:', err);
      toast.error('Failed to load delivery totals');
    }
  };

  // Auto-calculate total amount when price per kg changes
  useEffect(() => {
    if (pricePerKg && totalKgs) {
      const price = parseFloat(pricePerKg);
      if (!isNaN(price) && price > 0) {
        setTotalAmount(price * totalKgs);
      } else {
        setTotalAmount(0);
      }
    } else {
      setTotalAmount(0);
    }
  }, [pricePerKg, totalKgs]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedFarmer) {
      toast.error('Please select a farmer');
      return;
    }
    if (!selectedType) {
      toast.error('Please select a delivery type');
      return;
    }
    if (!pricePerKg || parseFloat(pricePerKg) <= 0) {
      toast.error('Please enter a valid price per kg');
      return;
    }
    if (totalKgs <= 0) {
      toast.error('No deliveries available for payment');
      return;
    }
    if (deliveryIds.length === 0) {
      toast.error('No delivery selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the first delivery ID 
      const paymentData = {
        farmer: selectedFarmer._id,
        delivery: deliveryIds[0], // Primary delivery
        deliveryType: selectedType,
        kgsDelivered: totalKgs,
        pricePerKg: parseFloat(pricePerKg),
        amountPaid: totalAmount,
        date: paymentDate,
        status: 'Completed',
        currency: currency
      };

      await api.post('/payments', paymentData);
      toast.success('Payment recorded successfully');
      navigate('/dashboard/payments');
    } catch (err) {
      console.error('Payment creation failed:', err);
      toast.error(err?.response?.data?.msg || err?.response?.data?.errors?.[0] || 'Failed to create payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mb-4">Record Payment</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Farmer Selection - Searchable */}
          <div className="relative">
            <label className="form-label">Farmer *</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (farmerOptions.length > 0) setShowDropdown(true);
                }}
                placeholder="Type farmer name to search..."
                className="form-control w-full pr-10"
                autoComplete="off"
              />
              {isLoadingFarmers && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-[#238636] border-t-transparent rounded-full"></div>
                </div>
              )}
              {selectedFarmer && !isLoadingFarmers && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFarmer(null);
                    setSearchQuery('');
                    setFarmerOptions([]);
                    setAvailableTypes([]);
                    setSelectedType('');
                    setTotalKgs(0);
                    setDeliveryIds([]);
                    setPricePerKg('');
                    setTotalAmount(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Dropdown */}
            {showDropdown && farmerOptions.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-[#161b22] border border-gray-300 dark:border-[#30363d] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {farmerOptions.map((farmer) => (
                    <button
                      key={farmer._id}
                      type="button"
                      onClick={() => handleFarmerSelect(farmer)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#21262d] transition-colors border-b border-gray-100 dark:border-[#30363d] last:border-b-0"
                    >
                      <div className="font-medium text-gray-900 dark:text-[#e6edf3]">
                        {farmer.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-[#8b949e]">
                        {farmer.cellNumber} • {farmer.weighStation}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {searchQuery.length > 0 && searchQuery.length < 2 
                ? "Type at least 2 characters to search"
                : " "
              } 
            </p>
          </div>

          {/* Delivery Type Selection */}
          {availableTypes.length > 0 && (
            <div>
              <label className="form-label">Delivery Type *</label>
              <select
                value={selectedType}
                onChange={handleTypeChange}
                className="form-select w-full"
                required
              >
                <option value="">Select delivery type</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Only unpaid delivery types are shown
              </p>
            </div>
          )}

          {/* Total Kgs Display - Read Only */}
          {selectedType && (
            <div>
              <label className="form-label">Total Kgs Delivered ({selectedType})</label>
              <input
                type="number"
                value={totalKgs}
                readOnly
                className="form-control bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total unpaid {selectedType} deliveries: {totalKgs} kg
              </p>
            </div>
          )}

          {/* Price Per Kg */}
          {totalKgs > 0 && (
            <div>
              <label className="form-label">Price Per Kg (Ksh) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="form-control"
                placeholder="Enter price per kg"
                required
              />
            </div>
          )}

          {/* Total Amount - Read Only, Auto-calculated */}
          {totalAmount > 0 && (
            <div>
              <label className="form-label">Total Amount to Pay (Ksh)</label>
              <input
                type="number"
                value={totalAmount.toFixed(2)}
                readOnly
                className="form-control bg-gray-100 dark:bg-gray-700 cursor-not-allowed font-bold text-lg"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Calculated: {totalKgs} kg × Ksh {pricePerKg} = Ksh {totalAmount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Payment Date and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Payment Date *</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="form-control"
                readOnly
              />
            </div>
          </div>

          {/* Recorded By */}
          <div>
            <label className="form-label">Recorded By</label>
            <input
              type="text"
              value={authState?.user?.name || authState?.user?.username || ''}
              readOnly
              className="form-control bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFarmer || !selectedType || !pricePerKg || totalKgs <= 0}
              className="px-6 py-2 bg-[#1B4332] dark:bg-[#238636] hover:bg-[#2D6A4F] dark:hover:bg-[#2ea043] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Processing...' : 'Record Payment'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/payments')}
              className="px-6 py-2 border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Payment Process:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
          <li>Search and select the farmer</li>
          <li>Choose the delivery type (Cherry or Parchment)</li>
          <li>System loads total unpaid deliveries automatically</li>
          <li>Enter the price per kg</li>
          <li>Total amount is calculated automatically</li>
          <li>Confirm and submit the payment</li>
        </ol>
        <p className="text-xs text-blue-700 dark:text-blue-500 mt-3">
          ⚠️ Note: Once payment is recorded, the delivery status will be updated to "Paid" and cannot be paid again.
        </p>
      </div>
    </div>
  );
};

export default NewPayment;
