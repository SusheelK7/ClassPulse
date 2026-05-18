const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get notes by day
router.get('/day/:day', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id, classDay: req.params.day }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get notes for a specific class
router.get('/class/:classId', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id, classId: req.params.classId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { _id, id, ...body } = req.body;
    const note = await Note.create({ ...body, userId: req.user.id });
    res.status(201).json(note);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { _id, id, ...body } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...body, updatedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
