const authService = require('../services/auth.service');
const User = require('../../database/models/User');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await authService.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = authService.generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        password: await authService.hashPassword(Math.random().toString(36)),
        role: 'faculty',
        department: 'CSE(AI&ML)'
      });
    }
    
    user.lastLogin = new Date();
    await user.save();
    
    const token = authService.generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
