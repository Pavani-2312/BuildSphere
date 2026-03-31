const weekService = require('../services/week.service');

exports.getActiveWeek = async (req, res) => {
  try {
    const week = await weekService.getActiveWeek(req.user.department);
    res.json(week);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createWeek = async (req, res) => {
  try {
    const week = await weekService.createWeek(req.body, req.user);
    res.status(201).json(week);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.submitWeek = async (req, res) => {
  try {
    const week = await weekService.submitWeek(req.params.id, req.user);
    res.json(week);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
