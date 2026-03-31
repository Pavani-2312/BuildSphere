const User = require('../../database/models/User');
const authService = require('../services/auth.service');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ department: req.user.department });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    const hashedPassword = await authService.hashPassword(password);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      createdBy: req.user._id
    });
    
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
