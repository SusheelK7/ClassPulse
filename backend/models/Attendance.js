const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ userId: 1, classId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
