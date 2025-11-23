import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext.jsx';

const NewPayment = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const schema = yup.object({
    farmer: yup.string().required('Farmer is required'),
    delivery: yup.string().optional(),
    amountPaid: yup.number().typeError('Amount must be a number').positive('Amount must be positive').required('Amount is required'),
    date: yup.date().typeError('Date is required').required('Date is required'),
    status: yup.mixed().oneOf(['Completed','Pending','Failed']).required('Status is required'),
    currency: yup.string().required('Currency is required')
  });
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const [farmers, setFarmers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, dRes] = await Promise.all([api.get('/farmers'), api.get('/deliveries')]);
        setFarmers(fRes.data || []);
        setDeliveries(dRes.data || []);
      } catch (err) {
        console.error('Failed loading data', err);
      }
    };
    load();
  }, []);

  const onSubmit = async (payload) => {
    try {
      // Attach recordedBy from current user if available
      if (authState?.user?._id) payload.recordedBy = authState.user._id;
      await api.post('/payments', payload);
      toast.success('Payment recorded');
      navigate('/dashboard/payments');
    } catch (err) {
      console.error('Payment creation failed', err);
      toast.error(err?.response?.data?.msg || 'Failed to create payment');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Record Payment</h1>
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm">Farmer</label>
            <select className="select select-bordered w-full" {...register('farmer')}>
              <option value="">Select farmer</option>
              {farmers.map(f => <option key={f._id} value={f._id}>{f.name} ({f.cellNumber})</option>)}
            </select>
            {errors.farmer && <p className="text-[#D93025] text-sm mt-1">{errors.farmer.message}</p>}
          </div>

          <div>
            <label className="text-sm">Delivery</label>
            <select className="select select-bordered w-full" {...register('delivery')}>
              <option value="">Select delivery (optional)</option>
              {deliveries.map(d => (
                <option key={d._id} value={d._id}>
                  {new Date(d.date).toLocaleDateString()} - {d.kgsDelivered}kgs - {d.farmer?.name || d.farmer}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm">Amount Paid</label>
              <input type="number" step="0.01" className="input input-bordered w-full" {...register('amountPaid')} />
            </div>
            <div>
              <label className="text-sm">Date</label>
              <input type="date" className="input input-bordered w-full" {...register('date')} />
              {errors.date && <p className="text-[#D93025] text-sm mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="text-sm">Status</label>
              <select className="select select-bordered w-full" {...register('status')}>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              {errors.status && <p className="text-[#D93025] text-sm mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Currency</label>
              <input defaultValue="Ksh" className="input input-bordered w-full" {...register('currency')} />
              {errors.currency && <p className="text-[#D93025] text-sm mt-1">{errors.currency.message}</p>}
            </div>
            <div>
              <label className="text-sm">Recorded By (you)</label>
              <input readOnly value={authState?.user?.name || ''} className="input input-bordered w-full bg-gray-100" />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn" style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }} type="submit">Record Payment</button>
            <button type="button" onClick={() => navigate('/dashboard/payments')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPayment;
