const mongoose = require('mongoose');
const { ALL_ASSIGNMENT_STATUSES, ASSIGNMENT_STATUS } = require('../constants/status');

const assignmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ALL_ASSIGNMENT_STATUSES,
      default: ASSIGNMENT_STATUS.ASSIGNED,
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

assignmentSchema.index({ complaint: 1, officer: 1 });
assignmentSchema.index({ officer: 1, status: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
