const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const { protect, optionalAuth, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { ROLES } = require('../constants/roles');

// Nearby complaints route (placed before /:id)
router.get('/nearby', optionalAuth, complaintController.getNearbyComplaints);

// List & Create complaints
router.get('/', optionalAuth, complaintController.getComplaints);
router.post('/', protect, upload.array('images', 5), complaintController.createComplaint);

// Single complaint operations
router.get('/:id', optionalAuth, complaintController.getComplaintById);
router.patch('/:id', protect, complaintController.updateComplaint);
router.delete('/:id', protect, complaintController.deleteComplaint);

// Lifecycle status change
router.patch('/:id/status', protect, complaintController.updateStatus);

// Officer assignment (Admin only)
router.post('/:id/assign', protect, authorize(ROLES.ADMIN), complaintController.assignComplaint);

// Social: Comments (PRD Section 23)
const socialController = require('../controllers/social.controller');
router.post('/:id/comments', protect, socialController.addComment);
router.get('/:id/comments', optionalAuth, socialController.getComments);

// Social: Votes (PRD Section 24)
router.post('/:id/vote', protect, socialController.vote);
router.delete('/:id/vote', protect, socialController.unvote);

// Social: Follows (PRD Section 25)
router.post('/:id/follow', protect, socialController.follow);
router.delete('/:id/follow', protect, socialController.unfollow);

module.exports = router;
