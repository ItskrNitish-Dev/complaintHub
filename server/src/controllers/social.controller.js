const socialService = require('../services/social.service');
const { successResponse } = require('../utils/apiResponse');

const addComment = async (req, res, next) => {
  try {
    const comment = await socialService.addComment(
      req.params.id,
      req.user,
      req.body.content
    );
    return successResponse(res, 201, 'Comment added successfully', { comment });
  } catch (error) {
    next(error);
  }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await socialService.getComments(req.params.id);
    return successResponse(res, 200, 'Comments retrieved', comments);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await socialService.deleteComment(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return successResponse(res, 200, 'Comment deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

const vote = async (req, res, next) => {
  try {
    const result = await socialService.voteComplaint(req.params.id, req.user._id);
    return successResponse(res, 200, 'Vote recorded', result);
  } catch (error) {
    next(error);
  }
};

const unvote = async (req, res, next) => {
  try {
    const result = await socialService.unvoteComplaint(req.params.id, req.user._id);
    return successResponse(res, 200, 'Vote removed', result);
  } catch (error) {
    next(error);
  }
};

const follow = async (req, res, next) => {
  try {
    const result = await socialService.followComplaint(req.params.id, req.user._id);
    return successResponse(res, 200, 'Complaint followed', result);
  } catch (error) {
    next(error);
  }
};

const unfollow = async (req, res, next) => {
  try {
    const result = await socialService.unfollowComplaint(req.params.id, req.user._id);
    return successResponse(res, 200, 'Complaint unfollowed', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
  vote,
  unvote,
  follow,
  unfollow,
};
