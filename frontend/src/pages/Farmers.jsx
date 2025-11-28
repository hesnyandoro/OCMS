import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Phone, IdCard, Calendar, Grid, List, Trash2 } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canCreate, canDelete } from '../utils/permissions';
import { useSmartRefresh } from '../hooks/useSmartRefresh';

const Farmers = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [farmers, setFarmers] = useState([]);
  const [filteredFarmers, setFilteredFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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

  useEffect(() => {
    fetchFarmers();
  }, []);

  // Smart auto-refresh: 2 minutes, pauses on inactive tab
  useSmartRefresh(fetchFarmers, 120000);

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

  // Delete farmer function
  const handleDeleteFarmer = async (farmerId, farmerName) => {
    if (!window.confirm(`Are you sure you want to delete farmer "${farmerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/farmers/${farmerId}`);
      // Refresh farmers list
      const { data } = await api.get('/farmers');
      setFarmers(data);
      setFilteredFarmers(data);
    } catch (error) {
      console.error('Error deleting farmer:', error);
      alert('Failed to delete farmer. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100">Farmers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view registered farmers</p>
          </div>
          {canCreate(authState?.role, 'farmers') && (
            <button
              onClick={() => navigate('/dashboard/farmers/new')}
              className="flex items-center gap-2 bg-[#1B4332] dark:bg-dark-green-primary text-white px-6 py-3 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Add New Farmer</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-dark-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Search by name, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            />
          </div>
          
          {/* Region Filter */}
          <div>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            >
              <option value="All">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results count and View Toggle */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-[#1B4332] dark:text-dark-green-primary">{filteredFarmers.length}</span> of {farmers.length} farmers
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#1B4332] dark:bg-dark-green-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Grid View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#1B4332] dark:bg-dark-green-primary text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="List View"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Farmers Display */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading farmers...</div>
        </div>
      ) : filteredFarmers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No farmers found</p>
          <p className="text-gray-400 dark:text-dark-text-tertiary mt-2">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarmers.map(farmer => (
            <div
              key={farmer._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-[#1B4332] dark:border-dark-green-primary relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-[#1B4332] dark:text-gray-100">{farmer.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-[#F59E0B] dark:bg-dark-gold-primary text-white text-xs rounded-full font-medium">
                    {farmer.season}
                  </span>
                  {canDelete(authState?.role, 'farmers') && (
                    <button
                      onClick={() => handleDeleteFarmer(farmer._id, farmer.name)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
                      title="Delete farmer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone size={16} className="text-[#D93025] dark:text-red-400" />
                  <span className="text-sm">{farmer.cellNumber}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <IdCard size={16} className="text-[#D93025] dark:text-red-400" />
                  <span className="text-sm">{farmer.nationalId}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} className="text-[#D93025] dark:text-red-400" />
                  <span className="text-sm">{farmer.weighStation}</span>
                </div>
                
                {farmer.farmLocation?.address && (
                  <div className="text-xs text-gray-500 dark:text-dark-text-tertiary mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {farmer.farmLocation.address}
                  </div>
                )}
                
                {farmer.createdBy && (
                  <div className="text-xs text-gray-400 dark:text-dark-text-muted mt-2">
                    Added by: {farmer.createdBy.name || farmer.createdBy.username}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1B4332] dark:bg-dark-green-secondary text-white">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">National ID</th>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Region</th>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Season</th>
                <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Address</th>
                {canDelete(authState?.role, 'farmers') && (
                  <th className="py-3 px-6 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map((farmer, index) => (
                <tr 
                  key={farmer._id} 
                  className={`${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                  } hover:bg-[#F3F4F6] dark:hover:bg-gray-700 transition-colors`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-[#1B4332] dark:text-gray-100">{farmer.name}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone size={16} className="text-[#D93025] dark:text-red-400" />
                      <span className="text-sm">{farmer.cellNumber}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <IdCard size={16} className="text-[#D93025] dark:text-red-400" />
                      <span className="text-sm">{farmer.nationalId}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-100">
                      <MapPin size={16} className="text-[#F59E0B] dark:text-dark-gold-primary" />
                      <span className="text-sm">{farmer.weighStation}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-[#F59E0B] dark:bg-dark-gold-primary text-white text-xs rounded-full font-medium">
                      {farmer.season}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {farmer.farmLocation?.address || (
                      <span className="text-gray-400 dark:text-dark-text-muted italic">No address</span>
                    )}
                  </td>
                  {canDelete(authState?.role, 'farmers') && (
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDeleteFarmer(farmer._id, farmer.name)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all duration-200"
                        title="Delete farmer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Farmers;