const User = require('../Schemas/user');
const Department = require('../Schemas/Department');
const path = require('path');
const fs = require('fs');

// Dashboard
const dashboard = async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProfessors = await User.countDocuments({ role: 'professor' });
    const totalHODs = await User.countDocuments({ role: 'hod' });

    res.render('admin-dashboard', {
      user: { name: req.session.userName, role: req.session.userRole },
      stats: {
        departments: totalDepartments,
        students: totalStudents,
        professors: totalProfessors,
        hods: totalHODs
      }
    });
  } catch (error) {
    res.status(500).send('Error loading dashboard');
  }
};

// List all departments (User Story 4)
const listDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const typeFilter = req.query.type || '';

    // Build query
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (typeFilter) {
      query.type = typeFilter;
    }

    const totalDepartments = await Department.countDocuments(query);
    const departments = await Department.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get user counts for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const userCount = await User.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          userCount
        };
      })
    );

    const totalPages = Math.ceil(totalDepartments / limit);

    res.render('departments-list', {
      user: { name: req.session.userName, role: req.session.userRole },
      departments: departmentsWithCounts,
      currentPage: page,
      totalPages,
      search,
      typeFilter
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading departments');
  }
};

// Show create department form (User Story 3)
const showCreateForm = (req, res) => {
  res.render('create-department', {
    user: { name: req.session.userName, role: req.session.userRole },
    error: null
  });
};

// Create new department (User Story 3)
const createDepartment = async (req, res) => {
  try {
    const { name, type, address } = req.body;

    // Check if department already exists
    const existingDept = await Department.findOne({ name });
    if (existingDept) {
      return res.render('create-department', {
        user: { name: req.session.userName, role: req.session.userRole },
        error: 'Department with this name already exists'
      });
    }

    await Department.create({ name, type, address });
    res.redirect('/admin/departments?success=created');
  } catch (error) {
    console.error(error);
    res.render('create-department', {
      user: { name: req.session.userName, role: req.session.userRole },
      error: 'Error creating department'
    });
  }
};

// Show edit department form (User Story 5)
const showEditForm = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).send('Department not found');
    }

    res.render('edit-department', {
      user: { name: req.session.userName, role: req.session.userRole },
      department,
      error: null
    });
  } catch (error) {
    res.status(500).send('Error loading department');
  }
};

// Update department (User Story 5)
const updateDepartment = async (req, res) => {
  try {
    const { name, type, address } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).send('Department not found');
    }

    // Check if new name conflicts with another department
    if (name !== department.name) {
      const existingDept = await Department.findOne({ name, _id: { $ne: req.params.id } });
      if (existingDept) {
        return res.render('edit-department', {
          user: { name: req.session.userName, role: req.session.userRole },
          department,
          error: 'Department with this name already exists'
        });
      }
    }

    department.name = name;
    department.type = type;
    department.address = address;
    await department.save();

    res.redirect('/admin/departments?success=updated');
  } catch (error) {
    console.error(error);
    const department = await Department.findById(req.params.id);
    res.render('edit-department', {
      user: { name: req.session.userName, role: req.session.userRole },
      department,
      error: 'Error updating department'
    });
  }
};

// Delete department (User Story 6)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Check if department has associated users
    const userCount = await User.countDocuments({ department: department._id });
    
    if (userCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete department. It has ${userCount} associated user(s).` 
      });
    }

    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error deleting department' });
  }
};

module.exports = {
  dashboard,
  listDepartments,
  showCreateForm,
  createDepartment,
  showEditForm,
  updateDepartment,
  deleteDepartment
};