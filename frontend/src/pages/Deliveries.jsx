import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Calendar, TrendingUp, Package, User } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canCreate } from '../utils/permissions';

const Deliveries = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/deliveries');
        setDeliveries(data);
        setFilteredDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  useEffect(() => {
    let filtered = [...deliveries];
    
    if (startDate) {
      filtered = filtered.filter(d => new Date(d.date) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(d => new Date(d.date) <= endDate);
    }
    if (typeFilter !== 'All') {
      filtered = filtered.filter(d => d.type === typeFilter);
    }
    
    setFilteredDeliveries(filtered);
  }, [startDate, endDate, typeFilter, deliveries]);

  const totalKgs = filteredDeliveries.reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);
  const cherryKgs = filteredDeliveries.filter(d => d.type === 'Cherry').reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);
  const parchmentKgs = filteredDeliveries.filter(d => d.type === 'Parchment').reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332]">Deliveries</h1>
            <p className="text-gray-600 mt-1">Track and manage coffee deliveries</p>
          </div>
          {canCreate(authState?.role, 'deliveries') && (
            <button
              onClick={() => navigate('/dashboard/deliveries/new')}
              className="flex items-center gap-2 bg-[#D93025] text-white px-6 py-3 rounded-lg hover:bg-[#B52518] transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Record Delivery</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#1B4332]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Deliveries</p>
              <p className="text-3xl font-bold text-[#1B4332] mt-2">{filteredDeliveries.length}</p>
            </div>
            <Package size={40} className="text-[#1B4332] opacity-20" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#D93025]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Cherry</p>
              <p className="text-3xl font-bold text-[#D93025] mt-2">{cherryKgs.toFixed(2)} kg</p>
            </div>
            <TrendingUp size={40} className="text-[#D93025] opacity-20" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#F59E0B]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Parchment</p>
              <p className="text-3xl font-bold text-[#F59E0B] mt-2">{parchmentKgs.toFixed(2)} kg</p>
            </div>
            <TrendingUp size={40} className="text-[#F59E0B] opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <ReactDatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              isClearable
              placeholderText="Select start date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <ReactDatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              isClearable
              placeholderText="Select end date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Cherry">Cherry</option>
              <option value="Parchment">Parchment</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Total Weight: <span className="font-bold text-[#1B4332]">{totalKgs.toFixed(2)} kg</span>
          </p>
        </div>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading deliveries...</div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No deliveries found</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B4332] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Farmer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Weight (kg)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeliveries.map((delivery, index) => (
                  <tr key={delivery._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(delivery.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {delivery.farmer?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        delivery.type === 'Cherry' 
                          ? 'bg-[#D93025] text-white' 
                          : 'bg-[#F59E0B] text-white'
                      }`}>
                        {delivery.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#1B4332]">
                      {delivery.kgsDelivered} kg
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {delivery.region}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {delivery.driver}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
