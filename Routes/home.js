const express = require('express');
const router = express.Router();
const {requireAuth }= require('../Middlewares/auth');
const { home}= require('../Controllers/home');

router.get('/',requireAuth,home);

module.exports = router;

