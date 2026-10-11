const { Attachment, Complaint } = require('../models');
const { processUploadedFiles, deleteUploadedFile } = require('../middleware/upload.middleware');
const { AppError } = require('../utils/apiResponse');
const { NOTIFICATION_TYPES } = require('../constants/status');
const { notifyFollowersAndCreator } = require('../services/notification.service');

// POST /api/v1/complaints/:id/attachments
exports.uploadAttachments = async (req, res) => {
  const { id: complaintId } = req.params;
  const userId = req.user.id;

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  // Only creator, assigned officer, or admin can add attachments
  const isCreator = complaint.createdBy.toString() === userId.toString();
  const isOfficer = complaint.assignedOfficer && complaint.assignedOfficer.toString() === userId.toString();
  const isAdmin = req.user.role === 'ADMIN';
  if (!isCreator && !isOfficer && !isAdmin) {
    throw new AppError('Not authorized to add attachments to this complaint', 403, 'FORBIDDEN');
  }

  const uploaded = await processUploadedFiles(req.files);
  const attachmentDocs = uploaded.map((file) => ({
    complaint: complaintId,
    uploader: userId,
    url: file.url,
    publicId: file.publicId,
    fileType: file.fileType,
    originalName: file.originalName,
    size: file.size,
  }));

  const created = await Attachment.insertMany(attachmentDocs);

  // Notify followers and creator about new attachment
  await notifyFollowersAndCreator({
    complaint,
    type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
    title: `Attachment added to ${complaint.complaintNumber}`,
    message: `${req.user.name} added ${uploaded.length} attachment(s).`,
    excludeUserId: userId,
  });

  return res.status(201).json({
    success: true,
    message: 'Attachments uploaded successfully',
    data: created,
  });
};

// GET /api/v1/complaints/:id/attachments
exports.getAttachments = async (req, res) => {
  const { id: complaintId } = req.params;
  const attachments = await Attachment.find({ complaint: complaintId }).sort({ createdAt: -1 });
  return res.json({ success: true, data: attachments });
};

// DELETE /api/v1/attachments/:id
exports.deleteAttachment = async (req, res) => {
  const { id: attachmentId } = req.params;
  const userId = req.user.id;
  const attachment = await Attachment.findById(attachmentId);
  if (!attachment) {
    throw new AppError('Attachment not found', 404, 'ATTACHMENT_NOT_FOUND');
  }

  const complaint = await Complaint.findById(attachment.complaint);
  if (!complaint) {
    throw new AppError('Associated complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  // Authorization: creator, assigned officer, or admin
  const isCreator = complaint.createdBy.toString() === userId.toString();
  const isOfficer = complaint.assignedOfficer && complaint.assignedOfficer.toString() === userId.toString();
  const isAdmin = req.user.role === 'ADMIN';
  if (!isCreator && !isOfficer && !isAdmin) {
    throw new AppError('Not authorized to delete this attachment', 403, 'FORBIDDEN');
  }

  // Remove file from storage (Cloudinary or local)
  await deleteUploadedFile({ publicId: attachment.publicId, url: attachment.url });

  await Attachment.findByIdAndDelete(attachmentId);

  return res.json({ success: true, message: 'Attachment deleted' });
};
