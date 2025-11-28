import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      region: userHasRegion || ''
    }
  });
  const [farmers, setFarmers] = useState([]);
  const [selectedWeigh, setSelectedWeigh] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const dropdownRef = useRef(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSelectFarmer = async (farmer) => {
    setSelectedFarmer(farmer);
    setSearchTerm(farmer.name);
    setValue('farmer', farmer._id);
    setShowDropdown(false);
    setSelectedWeigh('');
    
    try {
      const res = await api.get(`/farmers/${farmer._id}`);
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
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (!e.target.value) {
      setValue('farmer', '');
      setSelectedFarmer(null);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cellNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-[#1B4332] dark:text-gray-100 mb-4">Record Delivery</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="form-label">Farmer</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search farmer by name or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            <input type="hidden" {...register('farmer')} />
            
            {showDropdown && searchTerm && filteredFarmers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredFarmers.map(f => (
                  <div
                    key={f._id}
                    onClick={() => handleSelectFarmer(f)}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{f.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{f.cellNumber}</div>
                  </div>
                ))}
              </div>
            )}
            
            {showDropdown && searchTerm && filteredFarmers.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No farmers found</p>
              </div>
            )}
            
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
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <ReactDatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select delivery date"
                    className="form-control cursor-pointer w-full"
                  />
                )}
              />
              {errors.date && <p className="text-danger">{errors.date.message}</p>}
            </div>
          </div>

          {/* Auto-prefilled Weigh Station (read-only) */}
          <div>
            <label className="form-label">Weigh Station (from farmer)</label>
            <input readOnly value={selectedWeigh} className="form-control bg-[#F3F4F6]" />
          </div>

          <div className="d-flex gap-2">
            <button className="btn bg-[#1B4332] dark:bg-dark-green-primary hover:bg-[#2D6A4F] dark:hover:bg-dark-green-hover text-white border-0" type="submit">Save Delivery</button>
            <button type="button" onClick={() => navigate('/dashboard/deliveries')} className="px-4 py-2 border border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-500 transition-all font-medium">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDelivery;
