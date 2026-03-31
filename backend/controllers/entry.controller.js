const entryService = require('../services/entry.service');

exports.getEntries = async (req, res) => {
  try {
    const { weekId, section } = req.query;
    const entries = await entryService.getEntries(weekId, section);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createEntry = async (req, res) => {
  try {
    const io = req.app.get('io');
    const entry = await entryService.createEntry(req.body, req.user, io);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEntry = async (req, res) => {
  try {
    const io = req.app.get('io');
    await entryService.deleteEntry(req.params.id, req.user, io);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
