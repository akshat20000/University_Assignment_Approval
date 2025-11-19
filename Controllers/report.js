// Admin Routes
app.get('/admin/reports', requireAuth, requireRole(['admin']), async (req, res) => {
  const totalAssignments = await Assignment.countDocuments();
  const byStatus = await Assignment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const recentAudits = await Audit.find()
    .populate('userId')
    .populate('assignmentId')
    .sort({ timestamp: -1 })
    .limit(50);
  
  res.render('admin-reports', {
    user: { name: req.session.userName, role: req.session.userRole },
    stats: { total: totalAssignments, byStatus },
    audits: recentAudits
  });
});