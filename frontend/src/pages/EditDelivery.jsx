import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Save, Calendar, User, Package, MapPin } from 'lucide-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EditDelivery = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { authState } = useContext(AuthContext);
  const userHasRegion = authState?.assignedRegion;
  
  const schema = yup.object({
    farmer: yup.string().required('Farmer is required'),
    type: yup.string().required('Type is required').oneOf(['Cherry', 'Parchment']),
    kgsDelivered: yup.number().typeError('Kgs must be a number').positive('Kgs must be positive').required('Kgs is required'),
    region: yup.string().required('Region is required'),
    driver: yup.string().required('Driver is required'),
    date: yup.date().typeError('Date is required').required('Date is required'),
    season: yup.string(),
    weighStation: yup.string()
  });

  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      region: userHasRegion || ''
    }
  });
  
  const [farmers, setFarmers] = useState([]);
  const [selectedWeigh, setSelectedWeigh] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load farmers and delivery data in parallel
        const [farmersRes, deliveryRes] = await Promise.all([
          api.get('/farmers'),
          api.get(`/deliveries/${id}`)
        ]);
        
        setFarmers(farmersRes.data || []);
        const deliveryData = deliveryRes.data;
        
        // Populate form with existing delivery data
        const formData = {
          farmer: deliveryData.farmer?._id || deliveryData.farmer || '',
          type: deliveryData.type || 'Cherry',
          kgsDelivered: deliveryData.kgsDelivered || 0,
          region: deliveryData.region || (userHasRegion || ''),
          driver: deliveryData.driver || '',
          date: deliveryData.date ? new Date(deliveryData.date).toISOString().split('T')[0] : '',
          season: deliveryData.season || '',
          weighStation: deliveryData.weighStation || ''
        };
        
        reset(formData);
        setSelectedWeigh(deliveryData.weighStation || deliveryData.farmer?.weighStation || '');
      } catch (err) {
        console.error('Failed loading data', err);
        toast.error('Failed to load delivery data');
        navigate('/dashboard/deliveries');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, navigate, reset, userHasRegion]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmit = async (payload) => {
    try {
      await api.put(`/deliveries/${id}`, payload);
      toast.success('Delivery updated successfully');
      navigate('/dashboard/deliveries');
    } catch (err) {
      console.error('Update delivery failed', err);
      toast.error(err?.response?.data?.msg || 'Failed to update delivery');
    }
  };

  const handleSelectFarmer = async (farmer) => {
    setSelectedFarmer(farmer);
    setSearchTerm(farmer.name);
    setValue('farmer', farmer._id);
    setShowDropdown(false);
    setSelectedWeigh('');
    
    try {
      const res = await api.get(`/farmers/${farmer._id}`);
      const f = res.data;
      if (f?.weighStation) {
        setSelectedWeigh(f.weighStation);
        setValue('weighStation', f.weighStation);
        // Auto-fill region field with farmer's weighStation if user has no assigned region
        if (!userHasRegion) {
          setValue('region', f.weighStation);
        }
      }
    } catch (err) {
      console.error('Load farmer failed', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setValue('farmer', '');
      setSelectedFarmer(null);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cellNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading delivery data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/deliveries')}
          className="flex items-center gap-2 text-[#1B4332] dark:text-dark-green-primary hover:text-[#0F2419] dark:hover:text-dark-green-hover mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Deliveries</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1B4332] dark:bg-dark-green-primary rounded-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-dark-green-primary">Edit Delivery</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update delivery information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Farmer Selection */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Farmer</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
              placeholder="Search farmer by name or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            <input type="hidden" {...register('farmer')} />
            
            {showDropdown && searchTerm && filteredFarmers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredFarmers.map(f => (
                  <div
                    key={f._id}
                    onClick={() => handleSelectFarmer(f)}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{f.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{f.cellNumber} • {f.weighStation || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}
            
            {showDropdown && searchTerm && filteredFarmers.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No farmers found</p>
              </div>
            )}
            
            {errors.farmer && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.farmer.message}</p>
            )}
          </div>

          {/* Type, Kgs, Season */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Type</label>
              <select 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                {...register('type')}
              >
                <option value="Cherry">Cherry</option>
                <option value="Parchment">Parchment</option>
              </select>
              {errors.type && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Kgs Delivered</label>
              <input 
                type="number" 
                step="0.01" 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                {...register('kgsDelivered')} 
                placeholder="Enter weight"
              />
              {errors.kgsDelivered && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.kgsDelivered.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Season</label>
              <select 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                {...register('season')}
              >
                <option value="">Select season</option>
                <option value="Long">Long Season</option>
                <option value="Short">Short Season</option>
              </select>
            </div>
          </div>

          {/* Region, Driver, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                Region
                {userHasRegion && (
                  <span className="text-gray-500 dark:text-dark-text-tertiary ms-2">(Auto-filled from your assigned region)</span>
                )}
              </label>
              <input 
                className={`w-full px-4 py-3 ${userHasRegion ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-700'} text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition`}
                {...register('region')} 
                readOnly={!!userHasRegion}
                placeholder="Enter region"
              />
              {errors.region && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.region.message}</p>
              )}
              {!userHasRegion && <small className="text-gray-500 dark:text-dark-text-tertiary">Enter the region for this delivery</small>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Driver</label>
              <input 
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition"
                {...register('driver')} 
                placeholder="Driver name"
              />
              {errors.driver && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.driver.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Date</label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <ReactDatePicker
                    selected={field.value ? new Date(field.value) : null}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select delivery date"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent transition cursor-pointer"
                  />
                )}
              />
              {errors.date && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Weigh Station */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
              <MapPin size={16} className="text-[#1B4332] dark:text-dark-green-primary" />
              Weigh Station (from farmer)
            </label>
            <input 
              readOnly 
              value={selectedWeigh} 
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              placeholder="Auto-filled from farmer"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button 
              type="submit"
              className="px-6 py-3 bg-[#1B4332] dark:bg-dark-green-primary hover:bg-[#2D5F4D] dark:hover:bg-dark-green-hover text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Update Delivery
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/deliveries')} 
              className="px-6 py-3 border border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-dark-border-secondary transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Updating this delivery will modify the existing record. Make sure all information is accurate before saving.
        </p>
      </div>
    </div>
  );
};

export default EditDelivery;
