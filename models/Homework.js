const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: [
      'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
      'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
      'Social Studies', 'Economics', 'Business Studies', 'Psychology', 'Sociology',
      'Political Science', 'Environmental Science', 'Literature', 'Philosophy'
    ]
  },
  class: {
    type: String,
    required: true,
    enum: [
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
      'Class 11', 'Class 12', 'Pre-K', 'Kindergarten'
    ]
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'done'],
    default: 'active'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: String, // Can be specific class or 'all'
    default: 'all'
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    submissionText: String,
    attachments: [{
      filename: String,
      originalName: String,
      path: String
    }],
    grade: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: String,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
homeworkSchema.index({ class: 1, subject: 1, dueDate: 1 });
homeworkSchema.index({ assignedBy: 1, status: 1 });
homeworkSchema.index({ dueDate: 1, status: 1 });

// Virtual for checking if homework is overdue
homeworkSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'done';
});

// Method to get homework summary
homeworkSchema.methods.getSummary = function() {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    subject: this.subject,
    class: this.class,
    dueDate: this.dueDate,
    status: this.status,
    isOverdue: this.isOverdue,
    submissionCount: this.submissions.length,
    assignedBy: this.assignedBy,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Homework', homeworkSchema);
