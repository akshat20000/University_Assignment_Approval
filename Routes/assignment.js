const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../Middlewares/auth');
const { create, getbyid, submit, resubmit, professor_review, hod_review } = require('../Controllers/assignment');
const upload = require('../Middlewares/upload'); 


//get
router.get('/new', requireAuth, requireRole(['student']), (req, res) => {
  res.render('new-assignment', { user: { name: req.session.userName, role: req.session.userRole } });
});
router.get('/:id', requireAuth, getbyid);

// POST 
router.post('/create', requireAuth, requireRole(['student']), upload.single('file'), create);
router.post('/:id/submit', requireAuth, requireRole(['student']), submit);
router.post('/:id/resubmit', requireAuth, requireRole(['student']), upload.single('file'), resubmit);
router.post('/:id/professor-review', requireAuth, requireRole(['professor']), professor_review);
router.post('/:id/hod-review', requireAuth, requireRole(['hod']), hod_review);

module.exports = router;
