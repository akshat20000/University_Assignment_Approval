const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['student', 'professor', 'hod', 'admin'] },
  department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Department'
  },
  departmentName: String, // Keep for backward compatibility
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);