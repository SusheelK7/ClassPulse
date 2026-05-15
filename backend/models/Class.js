const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  code: { type: String, default: '', trim: true },
  teacher: { type: String, default: '', trim: true },
  room: { type: String, default: '', trim: true },
  day: { type: String, required: true, enum: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  semester: { type: String, default: '' },
  color: { type: String, default: '#3B82F6' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
