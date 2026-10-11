const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: 'image/jpeg',
    },
    originalName: {
      type: String,
      default: 'attachment',
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attachment', attachmentSchema);
