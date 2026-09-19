const bcrypt = require('bcryptjs');
const User = require('../models/User');

const bootstrapAdmin = async () => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return existingAdmin;
  }

  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.warn('⚠️  No admin user exists. Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD to bootstrap the first admin.');
    return null;
  }

  if (password.length < 6) {
    console.error('❌ ADMIN_PASSWORD must be at least 6 characters. First admin was not created.');
    return null;
  }

  const admin = new User({
    username,
    email,
    password: await bcrypt.hash(password, 10),
    name: process.env.ADMIN_NAME || 'Administrator',
    role: 'admin'
  });

  await admin.save();
  console.log(`✅ First admin created: ${username} (${email})`);
  return admin;
};

module.exports = bootstrapAdmin;
