const { Comment, Vote, Follower, Complaint } = require('../models');
const { notifyFollowersAndCreator } = require('./notification.service');
const { AppError } = require('../utils/apiResponse');
const { NOTIFICATION_TYPES } = require('../constants/status');
const { ROLES } = require('../constants/roles');

// 1. Comments
const addComment = async (complaintId, user, content) => {
  if (!content || !content.trim()) {
    throw new AppError('Comment content cannot be empty', 400, 'EMPTY_COMMENT');
  }

  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const comment = await Comment.create({
    complaint: complaintId,
    user: user._id,
    content: content.trim(),
  });

  await Complaint.findByIdAndUpdate(complaintId, { $inc: { commentCount: 1 } });

  // Notify followers and creator about the comment
  await notifyFollowersAndCreator({
    complaint,
    type: NOTIFICATION_TYPES.COMMENT_ADDED,
    title: `New Comment on ${complaint.complaintNumber}`,
    message: `${user.name} commented: "${content.trim().substring(0, 80)}${content.length > 80 ? '...' : ''}"`,
    excludeUserId: user._id,
  });

  return comment.populate('user', 'name role profileImage');
};

const getComments = async (complaintId) => {
  return Comment.find({ complaint: complaintId })
    .populate('user', 'name role profileImage')
    .sort({ createdAt: 1 });
};

const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError('Comment not found', 404, 'COMMENT_NOT_FOUND');
  }

  const isAuthor = comment.user.toString() === userId.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  if (!isAuthor && !isAdmin) {
    throw new AppError('Not authorized to delete this comment', 403, 'FORBIDDEN');
  }

  await Promise.all([
    Comment.findByIdAndDelete(commentId),
    Complaint.findByIdAndUpdate(comment.complaint, { $inc: { commentCount: -1 } }),
  ]);

  return { id: commentId };
};

// 2. Votes (Upvotes)
const voteComplaint = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  // Prevent duplicate votes via DB check
  const existingVote = await Vote.findOne({ complaint: complaintId, user: userId });
  if (existingVote) {
    return { upvoteCount: complaint.upvoteCount, isUpvoted: true };
  }

  try {
    await Vote.create({ complaint: complaintId, user: userId });
    const updated = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { upvoteCount: 1 } },
      { new: true }
    );
    return { upvoteCount: updated.upvoteCount, isUpvoted: true };
  } catch (err) {
    if (err.code === 11000) {
      // Handled duplicate
      return { upvoteCount: complaint.upvoteCount, isUpvoted: true };
    }
    throw err;
  }
};

const unvoteComplaint = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const existingVote = await Vote.findOneAndDelete({ complaint: complaintId, user: userId });
  if (!existingVote) {
    return { upvoteCount: complaint.upvoteCount, isUpvoted: false };
  }

  const updated = await Complaint.findByIdAndUpdate(
    complaintId,
    { $inc: { upvoteCount: -1 } },
    { new: true }
  );

  return {
    upvoteCount: Math.max(0, updated ? updated.upvoteCount : 0),
    isUpvoted: false,
  };
};

// 3. Followers
const followComplaint = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const existingFollower = await Follower.findOne({ complaint: complaintId, user: userId });
  if (existingFollower) {
    return { followerCount: complaint.followerCount, isFollowed: true };
  }

  try {
    await Follower.create({ complaint: complaintId, user: userId });
    const updated = await Complaint.findByIdAndUpdate(
      complaintId,
      { $inc: { followerCount: 1 } },
      { new: true }
    );
    return { followerCount: updated.followerCount, isFollowed: true };
  } catch (err) {
    if (err.code === 11000) {
      return { followerCount: complaint.followerCount, isFollowed: true };
    }
    throw err;
  }
};

const unfollowComplaint = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const existingFollower = await Follower.findOneAndDelete({ complaint: complaintId, user: userId });
  if (!existingFollower) {
    return { followerCount: complaint.followerCount, isFollowed: false };
  }

  const updated = await Complaint.findByIdAndUpdate(
    complaintId,
    { $inc: { followerCount: -1 } },
    { new: true }
  );

  return {
    followerCount: Math.max(0, updated ? updated.followerCount : 0),
    isFollowed: false,
  };
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  voteComplaint,
  unvoteComplaint,
  followComplaint,
  unfollowComplaint,
};
