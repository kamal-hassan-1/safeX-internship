const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a candidate name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Please specify candidate role (e.g. Frontend Dev)'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interviewing', 'Offered', 'Accepted', 'Rejected'],
    default: 'Applied',
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
  },
  joinDate: {
    type: Date,
    default: Date.now,
  },
  resumeUrl: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Candidate', CandidateSchema);
