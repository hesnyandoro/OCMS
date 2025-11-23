import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const NewDelivery = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);
  const userHasRegion = authState?.assignedRegion;
  
  const schema = yup.object({
    farmer: yup.string().required('Farmer is required'),
    type: yup.string().required('Type is required').oneOf(['Cherry', 'Parchment']),
    kgsDelivered: yup.number().typeError('Kgs must be a number').positive('Kgs must be positive').required('Kgs is required'),
    region: yup.string().required('Region is required'),
    driver: yup.string().required('Driver is required'),
    date: yup.date().typeError('Date is required').required('Date is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      region: userHasRegion || ''
    }
  });
  const [farmers, setFarmers] = useState([]);
  const [selectedWeigh, setSelectedWeigh] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/farmers');
        setFarmers(res.data || []);
      } catch (err) {
        console.error('Failed loading farmers', err);
      }
    };
    load();
  }, []);

  const onSubmit = async (payload) => {
    try {
      // payload: farmer (id), type, kgsDelivered, region, driver, date
      await api.post('/deliveries', payload);
      toast.success('Delivery recorded');
      navigate('/dashboard/deliveries');
    } catch (err) {
      console.error('Record delivery failed', err);
      toast.error(err?.response?.data?.msg || 'Failed to record delivery');
    }
  };

  async function onFarmerChange(e) {
    const id = e.target.value;
    setValue('farmer', id);
    setSelectedWeigh('');
    if (!id) return;
    try {
      const res = await api.get(`/farmers/${id}`);
      const f = res.data;
      if (f?.weighStation) {
        setSelectedWeigh(f.weighStation);
        // Auto-fill region field with farmer's weighStation if user has no assigned region
        if (!userHasRegion) {
          setValue('region', f.weighStation);
        }
      }
    } catch (err) {
      console.error('Load farmer failed', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#F1F8F4] p-6">
      <h1 className="text-3xl font-bold text-[#1B4332] mb-4">Record Delivery</h1>
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Farmer</label>
            <select className="form-control" {...register('farmer')} onChange={onFarmerChange}>
              <option value="">Select farmer</option>
              {farmers.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.cellNumber})</option>
              ))}
            </select>
            {errors.farmer && <p className="text-danger">{errors.farmer.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Type</label>
              <select className="form-control" {...register('type')}>
                <option value="Cherry">Cherry</option>
                <option value="Parchment">Parchment</option>
              </select>
              {errors.type && <p className="text-danger">{errors.type.message}</p>}
            </div>

            <div>
              <label className="form-label">Kgs Delivered</label>
              <input type="number" step="0.01" className="form-control" {...register('kgsDelivered')} />
              {errors.kgsDelivered && <p className="text-danger">{errors.kgsDelivered.message}</p>}
            </div>

            <div>
              <label className="form-label">
                Region
                {userHasRegion && <span className="text-muted ms-2">(Auto-filled from your assigned region)</span>}
              </label>
              <input 
                className="form-control" 
                {...register('region')} 
                readOnly={!!userHasRegion}
                style={userHasRegion ? { backgroundColor: '#F3F4F6' } : {}}
              />
              {errors.region && <p className="text-danger">{errors.region.message}</p>}
              {!userHasRegion && <small className="text-muted">Enter the region for this delivery</small>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Driver</label>
              <input className="form-control" {...register('driver')} />
              {errors.driver && <p className="text-danger">{errors.driver.message}</p>}
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" {...register('date')} />
              {errors.date && <p className="text-danger">{errors.date.message}</p>}
            </div>
          </div>

          {/* Auto-prefilled Weigh Station (read-only) */}
          <div>
            <label className="form-label">Weigh Station (from farmer)</label>
            <input readOnly value={selectedWeigh} className="form-control bg-[#F3F4F6]" />
          </div>

          <div className="d-flex gap-2">
            <button className="btn" style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }} type="submit">Save Delivery</button>
            <button type="button" onClick={() => navigate('/dashboard/deliveries')} className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-all font-medium">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDelivery;
