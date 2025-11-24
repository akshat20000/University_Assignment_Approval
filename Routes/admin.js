const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../Middlewares/auth');
const {
  dashboard,
  listDepartments,
  showCreateForm,
  createDepartment,
  showEditForm,
  updateDepartment,
  deleteDepartment
} = require('../Controllers/admin');

// Admin dashboard
router.get('/', requireAuth, requireRole(['admin']), dashboard);

// Department routes
router.get('/departments', requireAuth, requireRole(['admin']), listDepartments);
router.get('/departments/create', requireAuth, requireRole(['admin']), showCreateForm);
router.get('/departments/:id/edit', requireAuth, requireRole(['admin']), showEditForm);

router.post('/departments/create', requireAuth, requireRole(['admin']), createDepartment);
router.post('/departments/:id/update', requireAuth, requireRole(['admin']), updateDepartment);

router.delete('/departments/:id', requireAuth, requireRole(['admin']), deleteDepartment);

module.exports = router;