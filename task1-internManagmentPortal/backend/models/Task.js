const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  weekNumber: {
    type: Number,
    required: [true, 'Please specify the week number'],
    min: [1, 'Week number must be at least 1'],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: [true, 'Please assign the task to a candidate'],
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    default: 'Pending',
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  feedback: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
