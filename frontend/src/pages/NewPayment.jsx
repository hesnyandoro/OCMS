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
    <div className="min-h-screen bg-[#F1F8F4] p-6">
      <h1 className="text-3xl font-bold text-[#1B4332] mb-4">Record Payment</h1>
      <div className="bg-white p-6 rounded shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Farmer</label>
            <select className="form-control" {...register('farmer')}>
              <option value="">Select farmer</option>
              {farmers.map(f => <option key={f._id} value={f._id}>{f.name} ({f.cellNumber})</option>)}
            </select>
            {errors.farmer && <p className="text-danger">{errors.farmer.message}</p>}
          </div>

          <div>
            <label className="form-label">Delivery</label>
            <select className="form-control" {...register('delivery')}>
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
              <label className="form-label">Amount Paid</label>
              <input type="number" step="0.01" className="form-control" {...register('amountPaid')} />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input type="date" className="form-control" {...register('date')} />
              {errors.date && <p className="text-danger">{errors.date.message}</p>}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-control" {...register('status')}>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
              {errors.status && <p className="text-danger">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Currency</label>
              <input defaultValue="Ksh" className="form-control" {...register('currency')} />
              {errors.currency && <p className="text-danger">{errors.currency.message}</p>}
            </div>
            <div>
              <label className="form-label">Recorded By (you)</label>
              <input readOnly value={authState?.user?.name || ''} className="form-control bg-gray-100" />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn" style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }} type="submit">Save Payment</button>
            <button type="button" onClick={() => navigate('/dashboard/payments')} className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-all font-medium">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPayment;
