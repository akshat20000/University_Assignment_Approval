const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  course: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentName: String,
  filePath: String,
  fileName: String,
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'under_professor_review', 'under_hod_review', 'approved', 'rejected'],
    default: 'draft'
  },
  professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  professorFeedback: String,
  professorReviewedAt: Date,
  hodId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hodFeedback: String,
  hodReviewedAt: Date,
  submittedAt: Date,
  approvedAt: Date,
  version: { type: Number, default: 1 },
  previousVersions: [{
    filePath: String,
    feedback: String,
    reviewedAt: Date,
    version: Number
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);