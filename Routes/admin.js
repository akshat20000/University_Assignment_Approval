const express = require("express");
const router = express.Router();
const Department = require("../Schemas/Department");

const admin = require("../Controllers/admin");

// Departments
router.get("/departments", admin.getDepartments);
router.post("/departments/create", admin.createDepartment);
router.post("/departments/:id/update", admin.updateDepartment);
router.get("/departments/:id/delete", admin.deleteDepartment);

// Users
router.get("/users", admin.getUsers);
router.post("/users", admin.createUser);
router.post("/users/:id/update", admin.updateUser);
router.get("/users/:id/delete", admin.deleteUser);
router.get("/add-user", async (req, res) => {
  const departments = await Department.find();
  res.render("admin/add-user", { departments });
});

module.exports = router;
