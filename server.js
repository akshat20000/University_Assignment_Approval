require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongo= process.env.mongo_url;
const app = express();

// Schemas
const User = require("./Schemas/user");
const Assignment = require("./Schemas/assignment");
const Audit = require("./Schemas/audit")

// MongoDB Connection
mongoose.connect(mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
//const requireAuth = require('./Middlewares/auth.js');


////////////////////////////////////////////

app.use(session({
  secret: process.env.session_secret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
//Routes
app.use('/auth', require('./Routes/auth.js'));
app.use('/', require('./Routes/home.js'));
app.use('/assignments',require('./Routes/assignment.js'))
app.use('/admin', require('./Routes/admin.js'));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Create default admin user (run once)
async function createDefaultUsers() {
  try {
    const adminExists = await User.findOne({ email: 'admin@university.edu' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@university.edu',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Administration'
      });
      console.log('Default admin created: admin@university.edu / admin123');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}

createDefaultUsers();