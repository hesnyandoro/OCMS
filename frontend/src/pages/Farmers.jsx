import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Phone, IdCard, Calendar } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canCreate } from '../utils/permissions';

const Farmers = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/farmers');
        setFarmers(data);
        setFilteredFarmers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, []);

  useEffect(() => {
    let filtered = [...farmers];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cellNumber?.includes(searchTerm) ||
        f.nationalId?.includes(searchTerm)
      );
    }
    
    // Region filter
    if (regionFilter !== 'All') {
      filtered = filtered.filter(f => f.weighStation === regionFilter);
    }
    
    setFilteredFarmers(filtered);
  }, [searchTerm, regionFilter, farmers]);

  const regions = [...new Set(farmers.map(f => f.weighStation).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332]">Farmers</h1>
            <p className="text-gray-600 mt-1">Manage and view registered farmers</p>
          </div>
          {canCreate(authState?.role, 'farmers') && (
            <button
              onClick={() => navigate('/dashboard/farmers/new')}
              className="flex items-center gap-2 bg-[#1B4332] text-white px-6 py-3 rounded-lg hover:bg-[#2D6A4F] transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Add New Farmer</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            />
          </div>
          
          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent"
            >
              <option value="All">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-[#1B4332]">{filteredFarmers.length}</span> of {farmers.length} farmers
        </div>
      </div>

      {/* Farmers Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading farmers...</div>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No farmers found</p>
          <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map(farmer => (
            <div
              key={farmer._id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-[#1B4332]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-[#1B4332]">{farmer.name}</h3>
                <span className="px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">
                  {farmer.season}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-[#D93025]" />
                  <span className="text-sm">{farmer.cellNumber}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <IdCard size={16} className="text-[#D93025]" />
                  <span className="text-sm">{farmer.nationalId}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-[#D93025]" />
                  <span className="text-sm">{farmer.weighStation}</span>
                </div>
                
                {farmer.farmLocation?.address && (
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                    {farmer.farmLocation.address}
                  </div>
                )}
                
                {farmer.createdBy && (
                  <div className="text-xs text-gray-400 mt-2">
                    Added by: {farmer.createdBy.name || farmer.createdBy.username}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Farmers;