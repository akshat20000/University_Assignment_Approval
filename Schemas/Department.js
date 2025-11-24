const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["UG", "PG", "Research"], required: true },
  address: { type: String, required: true }
});

module.exports = mongoose.model("Department", departmentSchema);
