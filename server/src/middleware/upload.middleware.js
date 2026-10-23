const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

const { cloudinary, isConfigured } = require('../config/cloudinary');
const { AppError } = require('../utils/apiResponse');

// Use memory storage instead of disk storage.
// This avoids writing files to Vercel's read-only filesystem.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only JPEG, PNG, and WebP image formats are supported',
        400,
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
  },
  fileFilter,
});

// Upload a memory buffer directly to Cloudinary.
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'complaint_hub',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(stream);
  });
};

/**
 * Upload processed files to Cloudinary.
 * No local file paths or filesystem writes are required.
 */
const processUploadedFiles = async (files = []) => {
  if (!files || files.length === 0) {
    return [];
  }

  if (!isConfigured) {
    throw new AppError(
      'Image storage is not configured. Please try again later.',
      503,
      'IMAGE_STORAGE_NOT_CONFIGURED'
    );
  }

  const processed = [];

  for (const file of files) {
    try {
      const result = await uploadBufferToCloudinary(file.buffer);

      processed.push({
        url: result.secure_url,
        publicId: result.public_id,
        fileType: file.mimetype,
        originalName: path.basename(file.originalname),
        size: file.size,
      });
    } catch (error) {
      console.error('Cloudinary upload failed:', error);

      // Do not fall back to local storage on Vercel.
      throw new AppError(
        'Failed to upload complaint image. Please try again.',
        502,
        'IMAGE_UPLOAD_FAILED'
      );
    }
  }

  return processed;
};

module.exports = {
  upload,
  processUploadedFiles,
};
