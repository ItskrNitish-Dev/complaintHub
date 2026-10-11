const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const { protect } = require('../middleware/auth.middleware');

router.delete('/:id', protect, socialController.deleteComment);

module.exports = router;
