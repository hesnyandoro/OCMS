import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success('Login successful');
      navigate('/');
    } catch (err) {
      // Try to surface server-side message if available
      const serverMsg = err?.response?.data?.msg || (err?.response?.data?.errors && err.response.data.errors.map(x=>x.msg).join(', '));
      const message = serverMsg || err.message || 'Login failed due to server error';
      toast.error(message);
      console.error('Login failed:', err);
      // avoid alert in production; keep for quick feedback
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        id="username"
        name="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        autoComplete="username"
      />
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
      />
      <button className ="text-green-500 p-4 bg-gray-300"  type="submit">Login</button>
    </form>
  );
};

export default Login;