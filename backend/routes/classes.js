const express = require('express');
const Class = require('../models/Class');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all classes for user
router.get('/', auth, async (req, res) => {
  try {
    const classes = await Class.find({ userId: req.user.id }).sort({ day: 1, startTime: 1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add single class
router.post('/', auth, async (req, res) => {
  try {
    // Strip any client-sent _id or id to let MongoDB generate its own
    const { _id, id, ...body } = req.body;
    const cls = await Class.create({ ...body, userId: req.user.id });
    res.status(201).json(cls);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate entry error. Please try again.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Bulk add classes (from AI extraction)
router.post('/bulk', auth, async (req, res) => {
  try {
    const { classes, clearExisting } = req.body;
    if (clearExisting) await Class.deleteMany({ userId: req.user.id });
    const created = await Class.insertMany(classes.map(({ _id, id, ...c }) => ({ ...c, userId: req.user.id })));
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update class
router.put('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete class
router.delete('/:id', auth, async (req, res) => {
  try {
    const cls = await Class.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete all classes
router.delete('/', auth, async (req, res) => {
  try {
    await Class.deleteMany({ userId: req.user.id });
    res.json({ message: 'All classes deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;