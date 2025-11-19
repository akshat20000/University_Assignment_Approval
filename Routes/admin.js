const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../Middlewares/auth');

router.get('/',requireRole(['admin']))