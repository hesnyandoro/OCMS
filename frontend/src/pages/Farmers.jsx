import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Farmers = () => {
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const { data } = await api.get('/farmers');
        setFarmers(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFarmers();
  }, []);

  return (
    <div>
      <h1>Farmers</h1>
      <table className="table">
        <thead><tr><th>Name</th><th>Cell</th></tr></thead>
        <tbody>{farmers.map(f => <tr key={f._id}><td>{f.name}</td><td>{f.cellNumber}</td></tr>)}</tbody>
      </table>
      {/* Add form for create */}
    </div>
  );
};

export default Farmers;