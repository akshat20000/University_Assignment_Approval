const mongoose = require('mongoose');


const auditSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  details: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Audit', auditSchema);
