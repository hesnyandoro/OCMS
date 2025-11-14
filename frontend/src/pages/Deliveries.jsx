// Similar to Farmers, with date picker using react-datepicker
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const { data } = await api.get('/deliveries', { params: { startDate, endDate } });
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDeliveries();
  }, [startDate, endDate]);

  return (
    <div>
      <h1>Deliveries</h1>
      <form onSubmit={e => e.preventDefault()}>
        <div>
          <label>
            Start Date:
            <ReactDatePicker selected={startDate} onChange={date => setStartDate(date)} />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <ReactDatePicker selected={endDate} onChange={date => setEndDate(date)} />
          </label>
        </div>
        <button type="submit">Generate</button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Farm Name</th>
            <th>Type</th>
            <th>Kgs Delivered</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(d => <tr key={d._id}>
            <td>{new Date(d.date).toLocaleDateString()}</td>
            <td>{d.farmer.name}</td>
            <td>{d.type}</td>
            <td>{d.kgsDelivered}</td>
          </tr>)}
        </tbody>
      </table>
    </div>
  );
};

export default Deliveries;
