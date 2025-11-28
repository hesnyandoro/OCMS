const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const compression = require('compression');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

const app = express();

// CORS configuration - allow development and production origins
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  process.env.FRONTEND_URL, // Production frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production (served from same origin)
    }
  },
  methods: ['GET','HEAD', 'PATCH', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Enable gzip compression for all responses
app.use(compression());

app.use(express.json());

// Cache control for static assets
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads')) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/dashboard', dashboardRoutes);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // Catch-all route to serve index.html for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

mongoose.set('strictQuery', true);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB CONNECTED SUCCESSFULLY');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('MongoDB CONNECTION FAILED', err.message);
  }
};

connectDB();

