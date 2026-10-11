const {
  Complaint,
  Category,
  Department,
  User,
  StatusHistory,
  Assignment,
  Comment,
  Vote,
  Follower,
  Attachment,
} = require('../models');
const { generateComplaintNumber } = require('../utils/numberGenerator');
const { processUploadedFiles } = require('../middleware/upload.middleware');
const { notifyFollowersAndCreator, createNotification } = require('./notification.service');
const { AppError } = require('../utils/apiResponse');
const {
  COMPLAINT_STATUS,
  VALID_STATUS_TRANSITIONS,
  ASSIGNMENT_STATUS,
  NOTIFICATION_TYPES,
} = require('../constants/status');
const { PRIORITIES, ALL_PRIORITIES } = require('../constants/priorities');
const { ROLES } = require('../constants/roles');

/**
 * Create a new complaint
 */
const createComplaint = async (userId, data, files = []) => {
  const { title, description, category: categoryId, priority, address, landmark, latitude, longitude, location } = data;

  if (!title || !description || !categoryId) {
    throw new AppError('Title, description, and category are required', 400, 'MISSING_FIELDS');
  }

  // Verify Category and Department
  const category = await Category.findById(categoryId).populate('department');
  if (!category) {
    throw new AppError('Specified category does not exist', 404, 'CATEGORY_NOT_FOUND');
  }

  const departmentId = category.department?._id || category.department;

  // Process Coordinates
  let coords = null;
  if (location && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    coords = [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])];
  } else if (latitude !== undefined && longitude !== undefined) {
    coords = [parseFloat(longitude), parseFloat(latitude)];
  } else {
    // Default to city center coordinates if none supplied
    coords = [-73.985131, 40.748817];
  }

  // Handle uploaded images
  const uploadedFiles = await processUploadedFiles(files);
  const imageUrls = uploadedFiles.map((f) => f.url);

  // Generate unique complaint number (CH-YYYY-XXXXXX)
  const complaintNumber = await generateComplaintNumber();

  const chosenPriority = priority && ALL_PRIORITIES.includes(priority)
    ? priority
    : category.defaultPriority || PRIORITIES.MEDIUM;

  const complaint = await Complaint.create({
    complaintNumber,
    title: title.trim(),
    description: description.trim(),
    summary: data.summary ? data.summary.trim() : title.trim().substring(0, 100),
    createdBy: userId,
    category: category._id,
    department: departmentId,
    status: COMPLAINT_STATUS.SUBMITTED,
    priority: chosenPriority,
    location: {
      type: 'Point',
      coordinates: coords,
      address: address ? address.trim() : (location?.address || ''),
      landmark: landmark ? landmark.trim() : (location?.landmark || ''),
    },
    images: imageUrls,
  });

  // Create initial status history entry
  await StatusHistory.create({
    complaint: complaint._id,
    status: COMPLAINT_STATUS.SUBMITTED,
    changedBy: userId,
    note: 'Complaint registered by citizen with initial details.',
  });

  // Save attachments records
  if (uploadedFiles.length > 0) {
    const attachmentDocs = uploadedFiles.map((file) => ({
      complaint: complaint._id,
      uploader: userId,
      url: file.url,
      publicId: file.publicId,
      fileType: file.fileType,
      originalName: file.originalName,
      size: file.size,
    }));
    await Attachment.insertMany(attachmentDocs);
  }

  // Automatically follow own complaint
  await Follower.create({
    complaint: complaint._id,
    user: userId,
  });
  await Complaint.findByIdAndUpdate(complaint._id, { followerCount: 1 });

  // Create in-app notification for the creator
  await createNotification({
    recipient: userId,
    type: NOTIFICATION_TYPES.COMPLAINT_CREATED,
    title: `Complaint Submitted: ${complaintNumber}`,
    message: `Your complaint "${title.trim()}" has been received and assigned reference number ${complaintNumber}.`,
    complaint: complaint._id,
  });

  return getComplaintById(complaint._id, userId);
};

/**
 * Query complaints with filtering, search, pagination, and sorting
 */
const getComplaints = async (query = {}, currentUser = null) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    category,
    department,
    createdBy,
    assignedOfficer,
    search,
    sort = '-createdAt',
  } = query;

  const filter = {};

  // Existing filters
  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (category) {
    filter.category = category;
  }

  if (department) {
    filter.department = department;
  }

  if (createdBy) {
    filter.createdBy = createdBy;
  }

  if (assignedOfficer) {
    filter.assignedOfficer = assignedOfficer;
  }

  // FollowedBy filter – return complaints the user follows
  if (query.followedBy) {
    const followed = await Follower.find({ user: query.followedBy }).select('complaint');
    const followedIds = followed.map((f) => f.complaint);
    filter._id = { $in: followedIds };
  }

  if (search) {
    filter.$or = [
      { complaintNumber: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('createdBy', 'name email role profileImage')
      .populate('assignedOfficer', 'name email role department')
      .populate('category', 'name slug icon')
      .populate('department', 'name code')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  // Enrich with user vote & follow status if user is authenticated
  if (currentUser && complaints.length > 0) {
    const complaintIds = complaints.map((c) => c._id);
    const [userVotes, userFollows] = await Promise.all([
      Vote.find({ complaint: { $in: complaintIds }, user: currentUser._id }).select('complaint'),
      Follower.find({ complaint: { $in: complaintIds }, user: currentUser._id }).select('complaint'),
    ]);

    const votedSet = new Set(userVotes.map((v) => v.complaint.toString()));
    const followedSet = new Set(userFollows.map((f) => f.complaint.toString()));

    complaints.forEach((c) => {
      c.isUpvoted = votedSet.has(c._id.toString());
      c.isFollowed = followedSet.has(c._id.toString());
    });
  }

  return {
    complaints,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Geospatial search: GET /api/v1/complaints/nearby?lat=...&lng=...&radius=...
 */
const getNearbyComplaints = async ({ lat, lng, radius = 5000 }, currentUser = null) => {
  if (lat === undefined || lng === undefined) {
    throw new AppError('Latitude (lat) and Longitude (lng) are required', 400, 'MISSING_COORDINATES');
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMeters = Math.max(100, Math.min(50000, parseInt(radius, 10) || 5000)); // 100m to 50km

  const complaints = await Complaint.find({
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusMeters,
      },
    },
  })
    .populate('createdBy', 'name email role')
    .populate('category', 'name slug icon')
    .populate('department', 'name code')
    .limit(50)
    .lean();

  if (currentUser && complaints.length > 0) {
    const complaintIds = complaints.map((c) => c._id);
    const [userVotes, userFollows] = await Promise.all([
      Vote.find({ complaint: { $in: complaintIds }, user: currentUser._id }).select('complaint'),
      Follower.find({ complaint: { $in: complaintIds }, user: currentUser._id }).select('complaint'),
    ]);

    const votedSet = new Set(userVotes.map((v) => v.complaint.toString()));
    const followedSet = new Set(userFollows.map((f) => f.complaint.toString()));

    complaints.forEach((c) => {
      c.isUpvoted = votedSet.has(c._id.toString());
      c.isFollowed = followedSet.has(c._id.toString());
    });
  }

  return complaints;
};

/**
 * Get complaint details with complete relations, status timeline, and comments
 */
const getComplaintById = async (id, currentUser = null) => {
  const complaint = await Complaint.findById(id)
    .populate('createdBy', 'name email role profileImage')
    .populate('assignedOfficer', 'name email role department phone')
    .populate('category')
    .populate('department')
    .lean();

  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  // Get status history
  const statusHistory = await StatusHistory.find({ complaint: id })
    .populate('changedBy', 'name role')
    .sort({ createdAt: 1 })
    .lean();

  // Get comments
  const comments = await Comment.find({ complaint: id })
    .populate('user', 'name role profileImage')
    .sort({ createdAt: 1 })
    .lean();

  // Check if current user has upvoted or followed
  let isUpvoted = false;
  let isFollowed = false;

  if (currentUser) {
    const [vote, follower] = await Promise.all([
      Vote.findOne({ complaint: id, user: currentUser._id }),
      Follower.findOne({ complaint: id, user: currentUser._id }),
    ]);
    isUpvoted = !!vote;
    isFollowed = !!follower;
  }

  return {
    ...complaint,
    statusHistory,
    comments,
    isUpvoted,
    isFollowed,
  };
};

/**
 * Update complaint (only allowed when in SUBMITTED state by reporter or Admin)
 */
const updateComplaint = async (id, userId, userRole, data) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const isOwner = complaint.createdBy.toString() === userId.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to edit this complaint', 403, 'FORBIDDEN');
  }

  if (complaint.status !== COMPLAINT_STATUS.SUBMITTED && !isAdmin) {
    throw new AppError(
      'Complaints can only be edited while in SUBMITTED status',
      400,
      'CANNOT_EDIT_ACTIVE_COMPLAINT'
    );
  }

  if (data.title) complaint.title = data.title.trim();
  if (data.description) complaint.description = data.description.trim();
  if (data.priority && ALL_PRIORITIES.includes(data.priority)) complaint.priority = data.priority;
  if (data.category) {
    const cat = await Category.findById(data.category);
    if (cat) {
      complaint.category = cat._id;
      complaint.department = cat.department;
    }
  }

  await complaint.save();
  return getComplaintById(complaint._id, userId);
};

/**
 * Delete complaint (only allowed when in SUBMITTED state by reporter or Admin)
 */
const deleteComplaint = async (id, userId, userRole) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const isOwner = complaint.createdBy.toString() === userId.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    throw new AppError('You are not authorized to delete this complaint', 403, 'FORBIDDEN');
  }

  if (complaint.status !== COMPLAINT_STATUS.SUBMITTED && !isAdmin) {
    throw new AppError(
      'Complaints can only be deleted while in SUBMITTED status',
      400,
      'CANNOT_DELETE_ACTIVE_COMPLAINT'
    );
  }

  await Promise.all([
    Complaint.findByIdAndDelete(id),
    StatusHistory.deleteMany({ complaint: id }),
    Comment.deleteMany({ complaint: id }),
    Vote.deleteMany({ complaint: id }),
    Follower.deleteMany({ complaint: id }),
    Assignment.deleteMany({ complaint: id }),
  ]);

  return { id, complaintNumber: complaint.complaintNumber };
};

/**
 * Update complaint status with strict state machine validation (PRD Section 4)
 */
const updateComplaintStatus = async (id, newStatus, user, note = '') => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  const currentStatus = complaint.status;

  if (currentStatus === newStatus) {
    throw new AppError(`Complaint is already in status '${newStatus}'`, 400, 'SAME_STATUS');
  }

  // Validate state machine transition
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedTransitions.includes(newStatus) && user.role !== ROLES.ADMIN) {
    throw new AppError(
      `Transition from '${currentStatus}' to '${newStatus}' is not permitted`,
      400,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // Role authorization checks on specific status transitions
  if (user.role === ROLES.CITIZEN) {
    // Citizens can only cancel their own complaint when submitted
    if (newStatus !== COMPLAINT_STATUS.CANCELLED || complaint.createdBy.toString() !== user._id.toString()) {
      throw new AppError('Citizens are only permitted to cancel their own submitted complaints', 403, 'FORBIDDEN');
    }
  }

  if (user.role === ROLES.OFFICER) {
    // Officers can only update complaints assigned to them
    if (complaint.assignedOfficer?.toString() !== user._id.toString()) {
      throw new AppError('Officers can only update complaints assigned to them', 403, 'FORBIDDEN');
    }
    // Officers can move to IN_PROGRESS or RESOLVED
    const officerAllowed = [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.RESOLVED];
    if (!officerAllowed.includes(newStatus)) {
      throw new AppError(`Officers cannot transition complaints to '${newStatus}'`, 403, 'FORBIDDEN');
    }
  }

  // Update timestamps
  complaint.status = newStatus;
  if (newStatus === COMPLAINT_STATUS.RESOLVED) {
    complaint.resolvedAt = new Date();
  }
  if (newStatus === COMPLAINT_STATUS.CLOSED) {
    complaint.closedAt = new Date();
  }

  await complaint.save();

  // Create status history entry
  await StatusHistory.create({
    complaint: complaint._id,
    status: newStatus,
    changedBy: user._id,
    note: note || `Status changed from ${currentStatus} to ${newStatus} by ${user.name} (${user.role}).`,
  });

  // If assigned officer, update Assignment model if appropriate
  if (newStatus === COMPLAINT_STATUS.RESOLVED) {
    await Assignment.updateMany(
      { complaint: complaint._id, status: { $in: [ASSIGNMENT_STATUS.ASSIGNED, ASSIGNMENT_STATUS.IN_PROGRESS] } },
      { status: ASSIGNMENT_STATUS.COMPLETED, completedAt: new Date() }
    );
  }

  // Trigger notifications to followers and creator
  let notifType = NOTIFICATION_TYPES.STATUS_CHANGED;
  if (newStatus === COMPLAINT_STATUS.RESOLVED) notifType = NOTIFICATION_TYPES.COMPLAINT_RESOLVED;
  if (newStatus === COMPLAINT_STATUS.CLOSED) notifType = NOTIFICATION_TYPES.COMPLAINT_CLOSED;

  await notifyFollowersAndCreator({
    complaint,
    type: notifType,
    title: `Complaint Status Updated: ${complaint.complaintNumber}`,
    message: `The status for "${complaint.title}" has been updated to ${newStatus}. Note: ${note || 'No notes provided.'}`,
    excludeUserId: user._id,
  });

  return getComplaintById(complaint._id, user);
};

/**
 * Assign complaint to an officer (Admin only, PRD Section 12)
 */
const assignComplaintToOfficer = async (complaintId, officerId, adminUser, notes = '') => {
  const [complaint, officer] = await Promise.all([
    Complaint.findById(complaintId),
    User.findById(officerId),
  ]);

  if (!complaint) {
    throw new AppError('Complaint not found', 404, 'COMPLAINT_NOT_FOUND');
  }

  if (!officer || officer.role !== ROLES.OFFICER) {
    throw new AppError('Target user is not an officer', 400, 'INVALID_OFFICER');
  }

  const previousOfficer = complaint.assignedOfficer;
  complaint.assignedOfficer = officer._id;

  // If complaint was submitted or under review, transition status to ASSIGNED
  if (
    complaint.status === COMPLAINT_STATUS.SUBMITTED ||
    complaint.status === COMPLAINT_STATUS.UNDER_REVIEW
  ) {
    complaint.status = COMPLAINT_STATUS.ASSIGNED;
  }

  await complaint.save();

  // Create Assignment record
  await Assignment.create({
    complaint: complaint._id,
    officer: officer._id,
    assignedBy: adminUser._id,
    status: ASSIGNMENT_STATUS.ASSIGNED,
    notes: notes || `Assigned to ${officer.name}`,
  });

  // Create StatusHistory record
  await StatusHistory.create({
    complaint: complaint._id,
    status: complaint.status,
    changedBy: adminUser._id,
    note: `Assigned to officer ${officer.name}. Notes: ${notes || 'None'}`,
  });

  // Notify officer
  await createNotification({
    recipient: officer._id,
    type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
    title: `New Assignment: ${complaint.complaintNumber}`,
    message: `You have been assigned to handle complaint "${complaint.title}". Priority: ${complaint.priority}.`,
    complaint: complaint._id,
  });

  // Notify citizen creator & followers
  await notifyFollowersAndCreator({
    complaint,
    type: NOTIFICATION_TYPES.COMPLAINT_ASSIGNED,
    title: `Officer Assigned: ${complaint.complaintNumber}`,
    message: `Officer ${officer.name} has been assigned to investigate your complaint.`,
    excludeUserId: adminUser._id,
  });

  return getComplaintById(complaint._id, adminUser);
};

module.exports = {
  createComplaint,
  getComplaints,
  getNearbyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  updateComplaintStatus,
  assignComplaintToOfficer,
};
