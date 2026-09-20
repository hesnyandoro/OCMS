const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');
const dashboardRoutes = require('./routes/dashboard');

dotenv.config();

const app = express();

// Running behind Vercel's proxy, so express-rate-limit can read X-Forwarded-For
app.set('trust proxy', 1);

// CORS configuration - allow development and production origins
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'http://localhost', // Docker frontend container
  'http://frontend', // Docker internal DNS
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

app.use('/api/dashboard', dashboardRoutes);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/tracking', require('./routes/tracking'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reports', require('./routes/reports'));

module.exports = app;
