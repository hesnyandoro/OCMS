require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const bootstrapAdmin = require('./utils/bootstrapAdmin');

const start = async () => {
  try {
    await connectDB();
    console.log('MongoDB CONNECTED SUCCESSFULLY');
    await bootstrapAdmin();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('MongoDB CONNECTION FAILED', err.message);
    process.exit(1);
  }
};

start();
