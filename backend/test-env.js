const dotenv = require('dotenv');
dotenv.config(); // This loads the .env file in the same folder

console.log('--- ENV TEST ---');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('----------------');