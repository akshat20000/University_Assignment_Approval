const User = require("../Schemas/user");
const Department = require("../Schemas/Department");

// ===============================
//  DEPARTMENTS
// ===============================

// GET ALL DEPARTMENTS
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.render("admin/departments", { departments });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).send("Server error");
  }
};

// CREATE DEPARTMENT
const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;

    const exists = await Department.findOne({ code });
    if (exists)
      return res.status(400).send("Department with this code already exists");

    await Department.create({ name, code });
    res.redirect("/admin/departments");
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).send("Server error");
  }
};

// UPDATE DEPARTMENT
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    await Department.findByIdAndUpdate(id, { name, code });
    res.redirect("/admin/departments");
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).send("Server error");
  }
};

// DELETE DEPARTMENT
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    await Department.findByIdAndDelete(id);
    res.redirect("/admin/departments");
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).send("Server error");
  }
};

// ===============================
//  USERS
// ===============================

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("department");
    const departments = await Department.find();

    res.render("admin/users", { users, departments });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Server error");
  }
};

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).send("Email already registered");

    await User.create({
      name,
      email,
      password, // ideally hash it before save
      role,
      department,
    });

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).send("Server error");
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department } = req.body;

    await User.findByIdAndUpdate(id, {
      name,
      email,
      role,
      department,
    });

    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).send("Server error");
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).send("Server error");
  }
};


// ===============================
// EXPORT
// ===============================

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,

  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
