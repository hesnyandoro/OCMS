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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Record Delivery</h1>
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm">Farmer</label>
            <select className="select select-bordered w-full" {...register('farmer')} onChange={onFarmerChange}>
              <option value="">Select farmer</option>
              {farmers.map(f => (
                <option key={f._id} value={f._id}>{f.name} ({f.cellNumber})</option>
              ))}
            </select>
            {errors.farmer && <p className="text-[#D93025] text-sm mt-1">{errors.farmer.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Type</label>
              <select className="select select-bordered w-full" {...register('type')}>
                <option value="Cherry">Cherry</option>
                <option value="Parchment">Parchment</option>
              </select>
              {errors.type && <p className="text-[#D93025] text-sm mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <label className="text-sm">Kgs Delivered</label>
              <input type="number" step="0.01" className="input input-bordered w-full" {...register('kgsDelivered')} />
              {errors.kgsDelivered && <p className="text-[#D93025] text-sm mt-1">{errors.kgsDelivered.message}</p>}
            </div>

            <div>
              <label className="text-sm">
                Region
                {userHasRegion && <span className="text-gray-500 text-xs ml-2">(Auto-filled)</span>}
              </label>
              <input 
                className="input input-bordered w-full" 
                {...register('region')} 
                readOnly={!!userHasRegion}
                style={userHasRegion ? { backgroundColor: '#F3F4F6' } : {}}
              />
              {errors.region && <p className="text-[#D93025] text-sm mt-1">{errors.region.message}</p>}
              {!userHasRegion && <p className="text-xs text-gray-500 mt-1">Enter the region for this delivery</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Driver</label>
              <input className="input input-bordered w-full" {...register('driver')} />
              {errors.driver && <p className="text-[#D93025] text-sm mt-1">{errors.driver.message}</p>}
            </div>
            <div>
              <label className="text-sm">Date</label>
              <input type="date" className="input input-bordered w-full" {...register('date')} />
              {errors.date && <p className="text-[#D93025] text-sm mt-1">{errors.date.message}</p>}
            </div>
          </div>

          {/* Auto-prefilled Weigh Station (read-only) */}
          <div>
            <label className="text-sm">Weigh Station (from farmer)</label>
            <input readOnly value={selectedWeigh} className="input input-bordered w-full bg-[#F3F4F6]" />
          </div>

          <div className="flex gap-2">
            <button className="btn" style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }} type="submit">Save Delivery</button>
            <button type="button" onClick={() => navigate('/dashboard/deliveries')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDelivery;
