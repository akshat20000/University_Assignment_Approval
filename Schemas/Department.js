const mongoose = require('mongoose');

const departmentschema = new mongoose.Schema({

    name: { type: String, required: true, unique: true },

})

module.exports = mongoose.model('department', departmentschema);