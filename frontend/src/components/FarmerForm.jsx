import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthContext } from '../context/AuthContext';

const FarmerForm = ({ onSubmit, onCancel }) => {
  const { authState } = useContext(AuthContext);
  const userHasRegion = authState?.assignedRegion;
  
  // Dynamic schema based on whether user has assigned region
  const schema = yup.object().shape({
    name: yup.string().required('Name is required').min(3, 'Name must be at least 3 characters long'),
    cellNumber: yup.string().required('Cell number is required').matches(/^\d{10,13}$/, 'Cell number must be 10 or 13 digits'),
    nationalId: yup.string().required('National ID is required').matches(/^\d{8,12}$/, 'National ID must be 8 or 12 digits'),
    season: yup.string().required('Season is required').oneOf(['Long', 'Short']),
    farmLocation: yup.object().shape({
      lat: yup.number().required('Latitude is required').typeError('Latitude must be a number'),
      lng: yup.number().required('Longitude is required').typeError('Longitude must be a number'),
      address: yup.string().required('Address is required')
    }),
    weighStation: yup.string().required('Weigh station/region is required')
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      weighStation: userHasRegion || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input className="form-control" type="text" {...register('name')} />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
      </div>
      <div className="mb-3">
        <label className="form-label">Cell Number</label>
        <input className="form-control" type="text" {...register('cellNumber')} />
        {errors.cellNumber && <p className="text-danger">{errors.cellNumber.message}</p>}
      </div>
      <div className="mb-3">
        <label className="form-label">National ID</label>
        <input className="form-control" type="text" {...register('nationalId')} />
        {errors.nationalId && <p className="text-danger">{errors.nationalId.message}</p>}
      </div>
      <div className="mb-3">
        <label className="form-label">Season</label>
        <select className="form-select" {...register('season')} >
          <option value="Long">Long</option>
          <option value="Short">Short</option>
        </select>
        {errors.season && <p className="text-danger">{errors.season.message}</p>}
      </div>
      <div className="mb-3">
        <label className="form-label">Farm Location</label>
        <div className="row">
          <div className="col">
            <label className="form-label">Latitude</label>
            <input className="form-control" type="text" {...register('farmLocation.lat')} />
            {errors.farmLocation?.lat && <p className="text-danger">{errors.farmLocation?.lat?.message}</p>}
          </div>
          <div className="col">
            <label className="form-label">Longitude</label>
            <input className="form-control" type="text" {...register('farmLocation.lng')} />
            {errors.farmLocation?.lng && <p className="text-danger">{errors.farmLocation?.lng?.message}</p>}
          </div>
        </div>
        <div className="mt-3">
          <label className="form-label">Address</label>
          <input className="form-control" type="text" {...register('farmLocation.address')} />
          {errors.farmLocation?.address && <p className="text-danger">{errors.farmLocation?.address?.message}</p>}
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">
          Weigh Station / Region
          {userHasRegion && <span className="text-muted ms-2">(Auto-filled from your assigned region)</span>}
        </label>
        <input 
          className="form-control" 
          type="text" 
          {...register('weighStation')} 
          readOnly={!!userHasRegion}
          style={userHasRegion ? { backgroundColor: '#F3F4F6' } : {}}
        />
        {errors.weighStation && <p className="text-danger">{errors.weighStation.message}</p>}
        {!userHasRegion && <small className="text-muted">Enter the region/weigh station for this farmer</small>}
      </div>
      <div className="d-flex gap-2">
        <button className="btn" style={{ backgroundColor: '#1B4332', color: '#FFFFFF', borderColor: '#1B4332' }} type="submit">Submit</button>
        {onCancel && (
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default FarmerForm;
