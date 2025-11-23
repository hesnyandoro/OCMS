import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, Save, Calendar, User, Package, MapPin } from 'lucide-react';

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

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      region: userHasRegion || ''
    }
  });
  
  const [farmers, setFarmers] = useState([]);
  const [selectedWeigh, setSelectedWeigh] = useState('');
  const [loading, setLoading] = useState(true);

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

  async function onFarmerChange(e) {
    const farmerId = e.target.value;
    setValue('farmer', farmerId);
    setSelectedWeigh('');
    if (!farmerId) return;
    
    try {
      const res = await api.get(`/farmers/${farmerId}`);
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
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F8F4] flex items-center justify-center">
        <div className="text-gray-500">Loading delivery data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F8F4] p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/deliveries')}
          className="flex items-center gap-2 text-[#1B4332] hover:text-[#0F2419] mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Deliveries</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1B4332] rounded-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332]">Edit Delivery</h1>
            <p className="text-gray-600 mt-1">Update delivery information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Farmer Selection */}
          <div>
            <label className="form-label">Farmer</label>
            <select 
              className="form-control"
              {...register('farmer')} 
              onChange={onFarmerChange}
            >
              <option value="">Select farmer</option>
              {farmers.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} - {f.cellNumber} ({f.weighStation || 'N/A'})
                </option>
              ))}
            </select>
            {errors.farmer && (
              <p className="text-danger">{errors.farmer.message}</p>
            )}
          </div>

          {/* Type, Kgs, Season */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Type</label>
              <select 
                className="form-control"
                {...register('type')}
              >
                <option value="Cherry">Cherry</option>
                <option value="Parchment">Parchment</option>
              </select>
              {errors.type && (
                <p className="text-danger">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Kgs Delivered</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-control"
                {...register('kgsDelivered')} 
                placeholder="Enter weight"
              />
              {errors.kgsDelivered && (
                <p className="text-danger">{errors.kgsDelivered.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Season</label>
              <select 
                className="form-control"
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
              <label className="form-label">
                Region
                {userHasRegion && (
                  <span className="text-muted ms-2">(Auto-filled from your assigned region)</span>
                )}
              </label>
              <input 
                className="form-control"
                {...register('region')} 
                readOnly={!!userHasRegion}
                placeholder="Enter region"
                style={userHasRegion ? { backgroundColor: '#F3F4F6' } : {}}
              />
              {errors.region && (
                <p className="text-danger">{errors.region.message}</p>
              )}
              {!userHasRegion && <small className="text-muted">Enter the region for this delivery</small>}
            </div>

            <div>
              <label className="form-label">Driver</label>
              <input 
                className="form-control"
                {...register('driver')} 
                placeholder="Driver name"
              />
              {errors.driver && (
                <p className="text-danger">{errors.driver.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-control"
                {...register('date')} 
              />
              {errors.date && (
                <p className="text-danger">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Weigh Station */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={16} className="text-[#1B4332]" />
              Weigh Station (from farmer)
            </label>
            <input 
              readOnly 
              value={selectedWeigh} 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-[#F3F4F6] text-gray-600"
              placeholder="Auto-filled from farmer"
            />
          </div>

          {/* Buttons */}
          <div className="d-flex gap-2">
            <button 
              type="submit"
              className="btn" 
              style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }}
            >
              Update Delivery
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard/deliveries')} 
              className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Updating this delivery will modify the existing record. Make sure all information is accurate before saving.
        </p>
      </div>
    </div>
  );
};

export default EditDelivery;
