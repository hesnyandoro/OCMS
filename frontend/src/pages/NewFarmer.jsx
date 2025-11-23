import React from 'react';
import { useNavigate } from 'react-router-dom';
import FarmerForm from '../components/FarmerForm.jsx';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const NewFarmer = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      // API expects fields: name, cellNumber, nationalId, season, farmLocation, weighStation
      const res = await api.post('/farmers', data);
      toast.success('Farmer created');
      navigate('/dashboard/farmers');
    } catch (err) {
      console.error('Create farmer failed', err);
      const msg = err?.response?.data?.msg || 'Failed to create farmer';
      toast.error(msg);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/farmers');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Register New Farmer</h1>
      <div className="bg-white p-6 rounded shadow">
        <FarmerForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default NewFarmer;
