const mongoose = require('mongoose');
const path = require('path');
const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({path: envPath});
console.log('MONGO_URI loaded:', process.env.MONGO_URI);
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined. Check .env file and path.');
    return;
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected successfully!'))
  .catch(err => console.error(err));