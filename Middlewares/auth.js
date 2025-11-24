const session = require('express-session');
const express = require('express');
const app = express();  

//authentication 
// app.use(session({
//   secret: process.env.session_secret,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { maxAge: 24 * 60 * 60 * 1000 }
// }));

const requireAuth = (req, res, next) => {
  // console.log("inside requireAuth")
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

//authorization 
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.session.userRole)) {
      return res.status(403).send('Access denied');
    }
    next();
  };
};
module.exports = { requireAuth, requireRole };