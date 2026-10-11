const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema(
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

// Enforce single follower record per user per complaint
followerSchema.index({ complaint: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Follower', followerSchema);
