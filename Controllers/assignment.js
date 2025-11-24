const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Assignment = require('../Schemas/assignment');
const Audit = require('../Schemas/audit');
const { requireAuth, requireRole } = require('../Middlewares/auth');



//multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/assignments';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } 
});


const create= async (req, res) => {
  try {
    const { title, description, course, saveAs } = req.body;
    
    const assignment = await Assignment.create({
      title,
      description,
      course,
      studentId: req.session.userId,
      studentName: req.session.userName,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null,
      status: saveAs === 'submit' ? 'submitted' : 'draft',
      submittedAt: saveAs === 'submit' ? new Date() : null
    });
    
    await logAudit(assignment._id, req.session.userId, 'CREATE', `Assignment ${saveAs === 'submit' ? 'submitted' : 'saved as draft'}`);
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error creating assignment');
  }
};

const getbyid= async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('studentId')
      .populate('professorId')
      .populate('hodId');
    
    if (!assignment) {
      return res.status(404).send('Assignment not found');
    }
    
    const audits = await Audit.find({ assignmentId: assignment._id })
      .populate('userId')
      .sort({ timestamp: -1 });
    
    res.render('assignment-detail', { 
      assignment, 
      audits,
      user: { 
        id: req.session.userId, 
        name: req.session.userName, 
        role: req.session.userRole 
      }
    });
  } catch (error) {
    res.status(500).send('Error loading assignment');
  }
};

const submit= async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (assignment.studentId.toString() !== req.session.userId) {
      return res.status(403).send('Access denied');
    }
    
    assignment.status = 'submitted';
    assignment.submittedAt = new Date();
    await assignment.save();
    
    await logAudit(assignment._id, req.session.userId, 'SUBMIT', 'Assignment submitted for review');
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error submitting assignment');
  }
};

const resubmit=async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (assignment.studentId.toString() !== req.session.userId) {
      return res.status(403).send('Access denied');
    }
    
    
    assignment.previousVersions.push({
      filePath: assignment.filePath,
      feedback: assignment.professorFeedback || assignment.hodFeedback,
      reviewedAt: new Date(),
      version: assignment.version
    });
    
    assignment.version += 1;
    assignment.filePath = req.file.path;
    assignment.fileName = req.file.originalname;
    assignment.status = 'submitted';
    assignment.submittedAt = new Date();
    assignment.professorFeedback = null;
    assignment.hodFeedback = null;
    
    await assignment.save();
    await logAudit(assignment._id, req.session.userId, 'RESUBMIT', `Assignment resubmitted (Version ${assignment.version})`);
    
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error resubmitting assignment');
  }
};



//professor 
const professor_review= async (req, res) => {
  try {
    const { action, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    assignment.professorId = req.session.userId;
    assignment.professorFeedback = feedback;
    assignment.professorReviewedAt = new Date();
    
    if (action === 'approve') {
      assignment.status = 'under_hod_review';
      await logAudit(assignment._id, req.session.userId, 'PROFESSOR_APPROVE', 'Forwarded to HOD');
    } else {
      assignment.status = 'rejected';
      await logAudit(assignment._id, req.session.userId, 'PROFESSOR_REJECT', 'Assignment rejected by professor');
    }
    
    await assignment.save();
    res.redirect('/dashboard');
  } catch (error) {
    console.log(req.body)
    res.status(500).send('Error processing review');
  }
};

//hod
const hod_review= async (req, res) => {
  try {
    const { action, feedback } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    
    assignment.hodId = req.session.userId;
    assignment.hodFeedback = feedback;
    assignment.hodReviewedAt = new Date();
    
    if (action === 'approve') {
      assignment.status = 'approved';
      assignment.approvedAt = new Date();
      await logAudit(assignment._id, req.session.userId, 'HOD_APPROVE', 'Assignment approved');
    } else {
      assignment.status = 'rejected';
      await logAudit(assignment._id, req.session.userId, 'HOD_REJECT', 'Assignment rejected by HOD');
    }
    
    await assignment.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).send('Error processing review');
  }
};


module.exports={create,getbyid, submit, resubmit, professor_review, hod_review}