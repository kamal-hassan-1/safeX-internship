const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    unique: true,
    trim: true,
  },
  leadName: {
    type: String,
    required: [true, 'Please add a team lead or mentor name'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', GroupSchema);
