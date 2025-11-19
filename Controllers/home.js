const User = require('../Schemas/user');
const Assignment = require('../Schemas/assignment');
const path = require('path');
const fs = require('fs');

const home = async (req, res) => {
  const user = await User.findById(req.session.userId);
  let assignments = [];
  let stats = {};
  
  if (user.role === 'student') {
    assignments = await Assignment.find({ studentId: user._id }).sort({ createdAt: -1 });
    stats = {
      total: assignments.length,
      draft: assignments.filter(a => a.status === 'draft').length,
      submitted: assignments.filter(a => a.status === 'submitted' || a.status.includes('review')).length,
      approved: assignments.filter(a => a.status === 'approved').length,
      rejected: assignments.filter(a => a.status === 'rejected').length
    };
  } else if (user.role === 'professor') {
    assignments = await Assignment.find({ 
      status: { $in: ['submitted', 'under_professor_review'] }
    }).populate('studentId').sort({ submittedAt: -1 });
    stats = {
      pending: assignments.length,
      reviewed: await Assignment.countDocuments({ professorId: user._id })
    };
  } else if (user.role === 'hod') {
    assignments = await Assignment.find({ 
      status: 'under_hod_review'
    }).populate('studentId').populate('professorId').sort({ professorReviewedAt: -1 });
    stats = {
      pending: assignments.length,
      approved: await Assignment.countDocuments({ hodId: user._id, status: 'approved' })
    };
  }
  
  res.render('dashboard', { user, assignments, stats });
}





module.exports={home}