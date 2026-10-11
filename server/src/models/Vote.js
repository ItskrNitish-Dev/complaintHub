const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single vote per user per complaint at database level
voteSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
