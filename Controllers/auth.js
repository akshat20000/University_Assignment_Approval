const User = require('../Schemas/user');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const fs = require('fs');



const register = async (req, res) => {
    try {
        const { name, email, password, role, department } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            department
        });

        res.redirect('/auth/login');
    } catch (error) {
        res.render('register', { error: 'Registration failed. Email might already exist.' });
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        req.session.userId = user._id;
        req.session.userName = user.name;
        req.session.userRole = user.role;

        res.redirect('/');
    } catch (error) {
        res.render('login', { error: 'Login failed' });
    }
}

module.exports = {
    register,
    login
};