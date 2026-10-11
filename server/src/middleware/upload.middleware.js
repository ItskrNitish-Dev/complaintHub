const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isConfigured } = require('../config/cloudinary');
const { AppError } = require('../utils/apiResponse');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP image formats are supported', 400, 'INVALID_FILE_TYPE'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

/**
 * Process uploaded files: if Cloudinary is configured, upload to Cloudinary;
 * otherwise return local URL path `/uploads/filename`.
 */
const processUploadedFiles = async (files = []) => {
  if (!files || files.length === 0) return [];

  const processed = [];

  for (const file of files) {
    if (isConfigured) {
      try {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: 'complaint_hub',
          resource_type: 'image',
        });
        // Delete local temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        processed.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          fileType: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        });
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        // Fallback to local file URL if Cloudinary fails
        processed.push({
          url: `/uploads/${file.filename}`,
          publicId: '',
          fileType: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        });
      }
    } else {
      // Local storage
      processed.push({
        url: `/uploads/${file.filename}`,
        publicId: '',
        fileType: file.mimetype,
        originalName: file.originalname,
        size: file.size,
      });
    }
  }

  return processed;
};

module.exports = {
  upload,
  processUploadedFiles,
};
