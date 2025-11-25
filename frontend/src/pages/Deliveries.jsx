import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Plus, Calendar, TrendingUp, Package, User, Edit2, Trash2, Download, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { canCreate, canUpdate, canDelete } from '../utils/permissions';

const Deliveries = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
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
    if (regionFilter !== 'All') {
      filtered = filtered.filter(d => d.region === regionFilter);
    }
    if (driverFilter !== 'All') {
      filtered = filtered.filter(d => d.driver === driverFilter);
    }
    
    setFilteredDeliveries(filtered);
  }, [startDate, endDate, typeFilter, regionFilter, driverFilter, deliveries]);

  const totalKgs = filteredDeliveries.reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);
  const cherryKgs = filteredDeliveries.filter(d => d.type === 'Cherry').reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);
  const parchmentKgs = filteredDeliveries.filter(d => d.type === 'Parchment').reduce((sum, d) => sum + (Number(d.kgsDelivered) || 0), 0);

  const handleEdit = (deliveryId) => {
    navigate(`/dashboard/deliveries/edit/${deliveryId}`);
  };

  const handleDelete = async (deliveryId) => {
    if (!window.confirm('Are you sure you want to delete this delivery? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.delete(`/deliveries/${deliveryId}`);
      setDeliveries(deliveries.filter(d => d._id !== deliveryId));
    } catch (err) {
      console.error('Error deleting delivery:', err);
      alert(err.response?.data?.msg || 'Failed to delete delivery');
    }
  };

  const exportToCSV = () => {
    const rows = filteredDeliveries.map(d => ({
      Date: d.date ? new Date(d.date).toLocaleDateString() : '',
      Farmer: d.farmer?.name || 'N/A',
      'Farmer Phone': d.farmer?.cellNumber || '',
      Type: d.type || '',
      'Weight (kg)': d.kgsDelivered || 0,
      Region: d.region || '',
      Driver: d.driver || '',
      Season: d.season || '',
      'Vehicle Reg': d.vehicleReg || '',
      'Weigh Station': d.weighStation || ''
    }));
    
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deliveries_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(27, 67, 50); // Estate Green
    doc.text('Coffee Deliveries Report', 14, 20);
    
    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Deliveries: ${filteredDeliveries.length}`, 14, 34);
    doc.text(`Total Weight: ${totalKgs.toFixed(2)} kg`, 14, 40);
    
    // Table
    const headers = [['Date', 'Farmer', 'Type', 'Weight (kg)', 'Region', 'Driver']];
    const body = filteredDeliveries.map(d => [
      d.date ? new Date(d.date).toLocaleDateString() : '',
      d.farmer?.name || 'N/A',
      d.type || '',
      String(d.kgsDelivered || 0),
      d.region || '',
      d.driver || ''
    ]);
    
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 46,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [27, 67, 50] } // Estate Green
    });
    
    doc.save(`deliveries_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100">Deliveries</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage coffee deliveries</p>
          </div>
          {canCreate(authState?.role, 'deliveries') && (
            <button
              onClick={() => navigate('/dashboard/deliveries/new')}
              className="flex items-center gap-2 bg-[#1B4332] dark:bg-dark-green-primary text-white px-6 py-3 rounded-lg hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              <span>Record Delivery</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-[#1B4332] dark:border-dark-green-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Deliveries</p>
              <p className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mt-2">{filteredDeliveries.length}</p>
            </div>
            <Package size={40} className="text-[#1B4332] dark:text-dark-green-primary opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-[#D93025] dark:border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Cherry</p>
              <p className="text-3xl font-bold text-[#D93025] dark:text-red-400 mt-2">{cherryKgs.toFixed(2)} kg</p>
            </div>
            <TrendingUp size={40} className="text-[#D93025] dark:text-red-400 opacity-20" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-[#F59E0B] dark:border-dark-gold-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Parchment</p>
              <p className="text-3xl font-bold text-[#F59E0B] dark:text-yellow-400 mt-2">{parchmentKgs.toFixed(2)} kg</p>
            </div>
            <TrendingUp size={40} className="text-[#F59E0B] dark:text-yellow-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Start Date</label>
            <ReactDatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              isClearable
              placeholderText="Select start date"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">End Date</label>
            <ReactDatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              isClearable
              placeholderText="Select end date"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            >
              <option value="All">All Types</option>
              <option value="Cherry">Cherry</option>
              <option value="Parchment">Parchment</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Region</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            >
              <option value="All">All Regions</option>
              {[...new Set(deliveries.map(d => d.region).filter(Boolean))].sort().map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">Driver</label>
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] dark:focus:ring-dark-green-primary focus:border-transparent"
            >
              <option value="All">All Drivers</option>
              {[...new Set(deliveries.map(d => d.driver).filter(Boolean))].sort().map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Weight: <span className="font-bold text-[#1B4332] dark:text-gray-100">{totalKgs.toFixed(2)} kg</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#1B4332] dark:border-dark-green-primary text-[#1B4332] dark:text-dark-green-primary rounded-lg hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white transition-all"
              title="Export to CSV"
            >
              <FileText size={16} />
              <span>CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-[#D93025] dark:border-red-500 text-[#D93025] dark:text-red-400 rounded-lg hover:bg-[#D93025] dark:hover:bg-red-600 hover:text-white transition-all"
              title="Export to PDF"
            >
              <Download size={16} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 dark:text-dark-text-tertiary">Loading deliveries...</div>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No deliveries found</p>
          <p className="text-gray-400 dark:text-dark-text-muted mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1B4332] dark:bg-dark-green-secondary text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Farmer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Weight (kg)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Region</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Driver</th>
                  {(canUpdate(authState?.role, 'deliveries') || canDelete(authState?.role, 'deliveries')) && (
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDeliveries.map((delivery, index) => (
                  <tr key={delivery._id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(delivery.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400 dark:text-dark-text-muted" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                    <td className="px-6 py-4 text-sm font-semibold text-[#1B4332] dark:text-dark-green-primary">
                      {delivery.kgsDelivered} kg
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {delivery.region}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {delivery.driver}
                    </td>
                    {(canUpdate(authState?.role, 'deliveries') || canDelete(authState?.role, 'deliveries')) && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {canUpdate(authState?.role, 'deliveries') && (
                            <button
                              onClick={() => handleEdit(delivery._id)}
                              className="p-2 text-[#1B4332] dark:text-dark-green-primary hover:bg-[#1B4332] dark:hover:bg-dark-green-primary hover:text-white rounded-lg transition-all"
                              title="Edit delivery"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDelete(authState?.role, 'deliveries') && (
                            <button
                              onClick={() => handleDelete(delivery._id)}
                              className="p-2 text-[#D93025] dark:text-red-400 hover:bg-[#D93025] dark:hover:bg-red-600 hover:text-white rounded-lg transition-all"
                              title="Delete delivery"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
