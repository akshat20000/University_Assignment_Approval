const express = require('express');
const router = express.Router();
const { register, login } = require('../Controllers/auth');

// GET
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// POST
router.post('/register', register);
router.post('/login', login);

module.exports = router;
