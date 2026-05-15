const mongoose = require('mongoose');

const deadlineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  subject: { type: String, default: '', trim: true },
  dueDate: { type: Date, required: true },
  type: { type: String, enum: ['assignment', 'exam', 'quiz', 'project', 'other'], default: 'assignment' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Deadline', deadlineSchema);
