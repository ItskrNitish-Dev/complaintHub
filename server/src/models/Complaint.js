const mongoose = require('mongoose');
const { COMPLAINT_STATUS, ALL_COMPLAINT_STATUSES } = require('../constants/status');
const { PRIORITIES, ALL_PRIORITIES, DEFAULT_PRIORITY } = require('../constants/priorities');

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user reference is required'],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Complaint category is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Complaint department is required'],
      index: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ALL_COMPLAINT_STATUSES,
        message: 'Invalid complaint status: {VALUE}',
      },
      default: COMPLAINT_STATUS.SUBMITTED,
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ALL_PRIORITIES,
        message: 'Invalid priority level: {VALUE}',
      },
      default: DEFAULT_PRIORITY,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator: (coords) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90,
          message: 'Invalid GeoJSON coordinates: must be [longitude, latitude]',
        },
      },
      address: {
        type: String,
        default: '',
        trim: true,
      },
      landmark: {
        type: String,
        default: '',
        trim: true,
      },
    },
    images: {
      type: [String],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    upvoteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries (nearby radius search)
complaintSchema.index({ location: '2dsphere' });

// Compound indexes for fast filtered lookups
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ department: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ createdBy: 1, createdAt: -1 });
complaintSchema.index({ assignedOfficer: 1, status: 1 });
complaintSchema.index({ title: 'text', description: 'text', complaintNumber: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
