const complaintService = require('../services/complaint.service');
const { successResponse } = require('../utils/apiResponse');

const createComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.createComplaint(
      req.user._id,
      req.body,
      req.files || []
    );
    return successResponse(res, 201, 'Complaint created successfully', result);
  } catch (error) {
    next(error);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaints(req.query, req.user);
    return successResponse(res, 200, 'Complaints retrieved successfully', result.complaints, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getNearbyComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getNearbyComplaints(req.query, req.user);
    return successResponse(res, 200, 'Nearby complaints retrieved successfully', complaints);
  } catch (error) {
    next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    return successResponse(res, 200, 'Complaint details retrieved', complaint);
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateComplaint(
      req.params.id,
      req.user._id,
      req.user.role,
      req.body
    );
    return successResponse(res, 200, 'Complaint updated successfully', complaint);
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.deleteComplaint(
      req.params.id,
      req.user._id,
      req.user.role
    );
    return successResponse(res, 200, 'Complaint deleted successfully', result);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const complaint = await complaintService.updateComplaintStatus(
      req.params.id,
      status,
      req.user,
      note
    );
    return successResponse(res, 200, 'Complaint status updated successfully', complaint);
  } catch (error) {
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { officerId, notes } = req.body;
    const complaint = await complaintService.assignComplaintToOfficer(
      req.params.id,
      officerId,
      req.user,
      notes
    );
    return successResponse(res, 200, 'Complaint assigned to officer successfully', complaint);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getNearbyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateStatus,
  assignComplaint,
};
