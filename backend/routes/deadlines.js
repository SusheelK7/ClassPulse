const express = require('express');
const Deadline = require('../models/Deadline');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const deadlines = await Deadline.find({ userId: req.userId }).sort({ dueDate: 1 });
    res.json({ deadlines });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, subject, dueDate, type, priority, notes } = req.body;
    if (!title || !dueDate) return res.status(400).json({ message: 'Title and due date are required.' });
    const deadline = await Deadline.create({ userId: req.userId, title, subject, dueDate, type, priority, notes });
    res.status(201).json({ deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const deadline = await Deadline.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!deadline) return res.status(404).json({ message: 'Deadline not found.' });
    res.json({ deadline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Deadline.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deadline deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
