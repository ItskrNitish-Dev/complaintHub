const mongoose = require('mongoose');
const { ALL_COMPLAINT_STATUSES } = require('../constants/status');

const statusHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ALL_COMPLAINT_STATUSES,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

statusHistorySchema.index({ complaint: 1, createdAt: -1 });

module.exports = mongoose.model('StatusHistory', statusHistorySchema);
