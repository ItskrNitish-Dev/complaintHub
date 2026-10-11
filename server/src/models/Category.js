const mongoose = require('mongoose');
const { PRIORITIES, ALL_PRIORITIES, DEFAULT_PRIORITY } = require('../constants/priorities');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Associated department is required'],
      index: true,
    },
    defaultPriority: {
      type: String,
      enum: {
        values: ALL_PRIORITIES,
        message: 'Invalid priority: {VALUE}',
      },
      default: DEFAULT_PRIORITY,
    },
    icon: {
      type: String,
      default: 'AlertCircle',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate slug automatically if not provided
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
