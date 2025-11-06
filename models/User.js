const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' }
});

userSchema.statics.createUser = async function ({ username, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return this.create({ username, passwordHash, role: role || 'admin' });
};

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
