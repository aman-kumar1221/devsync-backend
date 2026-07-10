const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  requiredTechStack: {
    type: [String],
    default: []
  },
  timeline: {
    type: String // e.g., "2 weeks", "1 month"
  },
  status: {
    type: String,
    enum: ['recruiting', 'in-progress', 'completed'],
    default: 'recruiting'
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;