const express = require('express');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { classId, month } = req.query;
    const filter = { userId: req.userId };
    if (classId) filter.classId = classId;
    if (month) filter.date = { $regex: `^${month}` };
    const records = await Attendance.find(filter).populate('classId', 'subject day startTime endTime color');
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats per class
router.get('/stats', auth, async (req, res) => {
  try {
    const classes = await Class.find({ userId: req.userId });
    const stats = await Promise.all(classes.map(async (cls) => {
      const total = await Attendance.countDocuments({ userId: req.userId, classId: cls._id });
      const present = await Attendance.countDocuments({ userId: req.userId, classId: cls._id, status: 'present' });
      const late = await Attendance.countDocuments({ userId: req.userId, classId: cls._id, status: 'late' });
      return {
        classId: cls._id,
        subject: cls.subject,
        color: cls.color,
        day: cls.day,
        startTime: cls.startTime,
        total,
        present,
        late,
        absent: total - present - late,
        percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0
      };
    }));
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { classId, date, status } = req.body;
    const record = await Attendance.findOneAndUpdate(
      { userId: req.userId, classId, date },
      { status },
      { upsert: true, new: true }
    );
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
