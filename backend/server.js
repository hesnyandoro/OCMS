const path = require('path');
const app = require('./app');
const connectDB = require('./config/db');

// Serve React frontend in production (standalone/Docker deploys; on Vercel the
// SPA is served from the CDN instead)
if (process.env.NODE_ENV === 'production') {
  const express = require('express');
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

const start = async () => {
  try {
    await connectDB();
    console.log('MongoDB CONNECTED SUCCESSFULLY');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('MongoDB CONNECTION FAILED', err.message);
  }
};

start();
