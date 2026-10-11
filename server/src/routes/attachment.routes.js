const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent
const attachmentController = require('../controllers/attachment.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

// Upload attachments to a specific complaint
router.post('/', protect, upload.array('attachments', 5), attachmentController.uploadAttachments);

// List attachments for a complaint (public)
router.get('/', optionalAuth, attachmentController.getAttachments);

module.exports = router;
