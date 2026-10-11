const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const {
  User,
  RefreshToken,
  Department,
  Category,
  Complaint,
  StatusHistory,
  Assignment,
  Comment,
  Vote,
  Follower,
  Notification,
  Attachment,
  Counter,
} = require('../models');

const { ROLES } = require('../constants/roles');
const { COMPLAINT_STATUS, ASSIGNMENT_STATUS, NOTIFICATION_TYPES } = require('../constants/status');
const { PRIORITIES } = require('../constants/priorities');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/complainthub';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected! Purging existing collection data...');

    // Clean existing collections
    await Promise.all([
      User.deleteMany({}),
      RefreshToken.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      Complaint.deleteMany({}),
      StatusHistory.deleteMany({}),
      Assignment.deleteMany({}),
      Comment.deleteMany({}),
      Vote.deleteMany({}),
      Follower.deleteMany({}),
      Notification.deleteMany({}),
      Attachment.deleteMany({}),
      Counter.deleteMany({}),
    ]);

    console.log('Old data cleared. Seeding Departments...');

    // 1. Seed 8 Departments (PRD Section 6)
    const departmentsData = [
      { name: 'Road Department', code: 'ROAD', description: 'Handles road repairs, potholes, and highway upkeep.' },
      { name: 'Waste Management Department', code: 'WASTE', description: 'Manages municipal garbage collection, sanitation, and recycling.' },
      { name: 'Water Department', code: 'WATER', description: 'Maintains municipal clean water supply, pipe repairs, and meter issues.' },
      { name: 'Drainage Department', code: 'DRAIN', description: 'Addresses storm drainage, sewage blockages, and overflow problems.' },
      { name: 'Electricity Department', code: 'ELEC', description: 'Maintains city electrical infrastructure and municipal power lines.' },
      { name: 'Traffic Department', code: 'TRAFFIC', description: 'Maintains traffic signals, road signs, and congestion solutions.' },
      { name: 'Public Works Department', code: 'PWD', description: 'Oversees public civic structures, street lights, and pavements.' },
      { name: 'Public Safety Department', code: 'SAFETY', description: 'Handles public park maintenance, civic safety hazards, and urban order.' },
    ];
    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((dept) => {
      deptMap[dept.code] = dept._id;
    });

    console.log(`Seeded ${departments.length} departments. Seeding Categories...`);

    // 2. Seed 10 Categories (PRD Section 5)
    const categoriesData = [
      { name: 'Road & Potholes', slug: 'road-potholes', department: deptMap.ROAD, defaultPriority: PRIORITIES.HIGH, icon: 'AlertTriangle', description: 'Damaged asphalt, severe potholes, cave-ins, and uneven road surfaces.' },
      { name: 'Garbage & Waste', slug: 'garbage-waste', department: deptMap.WASTE, defaultPriority: PRIORITIES.MEDIUM, icon: 'Trash2', description: 'Uncollected refuse, overflowing dumpsters, and illegal garbage dumping.' },
      { name: 'Water Supply', slug: 'water-supply', department: deptMap.WATER, defaultPriority: PRIORITIES.HIGH, icon: 'Droplets', description: 'Pipeline burst, low pressure, contaminated water, or water outages.' },
      { name: 'Drainage', slug: 'drainage', department: deptMap.DRAIN, defaultPriority: PRIORITIES.HIGH, icon: 'Waves', description: 'Clogged storm drains, sewage overflows, and floodwater accumulation.' },
      { name: 'Street Lights', slug: 'street-lights', department: deptMap.PWD, defaultPriority: PRIORITIES.LOW, icon: 'Lightbulb', description: 'Dark lamp posts, flickering lamps, and damaged lighting poles.' },
      { name: 'Traffic', slug: 'traffic', department: deptMap.TRAFFIC, defaultPriority: PRIORITIES.MEDIUM, icon: 'Compass', description: 'Malfunctioning traffic signals, broken road dividers, or missing signs.' },
      { name: 'Public Safety', slug: 'public-safety', department: deptMap.SAFETY, defaultPriority: PRIORITIES.CRITICAL, icon: 'ShieldAlert', description: 'Immediate public hazards, open manholes, or structural danger.' },
      { name: 'Public Parks', slug: 'public-parks', department: deptMap.SAFETY, defaultPriority: PRIORITIES.LOW, icon: 'Trees', description: 'Damaged park benches, broken playground equipment, or overgrown shrubs.' },
      { name: 'Electricity', slug: 'electricity', department: deptMap.ELEC, defaultPriority: PRIORITIES.HIGH, icon: 'Zap', description: 'Hanging electrical wires, power transformer sparks, or meter faults.' },
      { name: 'Other', slug: 'other', department: deptMap.PWD, defaultPriority: PRIORITIES.MEDIUM, icon: 'HelpCircle', description: 'General civic complaints not covered by other categories.' },
    ];
    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.slug] = cat;
    });

    console.log(`Seeded ${categories.length} categories. Seeding Users...`);

    // 3. Seed Users (Admin, Officers, Citizens)
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@complainthub.local',
      password: 'Password@123',
      role: ROLES.ADMIN,
      phone: '+1 555-0100',
      isEmailVerified: true,
      isActive: true,
    });

    const officerRoad = await User.create({
      name: 'Marcus Vance (Road Officer)',
      email: 'officer.road@complainthub.local',
      password: 'Password@123',
      role: ROLES.OFFICER,
      department: deptMap.ROAD,
      phone: '+1 555-0201',
      isEmailVerified: true,
      isActive: true,
    });

    const officerWaste = await User.create({
      name: 'Elena Rostova (Sanitation Officer)',
      email: 'officer.waste@complainthub.local',
      password: 'Password@123',
      role: ROLES.OFFICER,
      department: deptMap.WASTE,
      phone: '+1 555-0202',
      isEmailVerified: true,
      isActive: true,
    });

    const officerWater = await User.create({
      name: 'David Chen (Water Utilities Officer)',
      email: 'officer.water@complainthub.local',
      password: 'Password@123',
      role: ROLES.OFFICER,
      department: deptMap.WATER,
      phone: '+1 555-0203',
      isEmailVerified: true,
      isActive: true,
    });

    const citizen1 = await User.create({
      name: 'Aiden Gallagher',
      email: 'citizen.john@complainthub.local',
      password: 'Password@123',
      role: ROLES.CITIZEN,
      phone: '+1 555-0301',
      isEmailVerified: true,
      isActive: true,
    });

    const citizen2 = await User.create({
      name: 'Maya Patel',
      email: 'citizen.sarah@complainthub.local',
      password: 'Password@123',
      role: ROLES.CITIZEN,
      phone: '+1 555-0302',
      isEmailVerified: true,
      isActive: true,
    });

    console.log('Seeded Users. Seeding Counter and Sample Complaints...');

    // 4. Seed Counter
    await Counter.create({
      name: 'complaintNumber_2026',
      seq: 4,
    });

    // 5. Seed Sample Complaints with various statuses
    // Sample 1: Pothole (In Progress)
    const complaint1 = await Complaint.create({
      complaintNumber: 'CH-2026-000001',
      title: 'Deep hazardous pothole near Central Avenue intersection',
      description: 'A deep pothole measuring approx 3 feet wide has formed directly on the eastbound lane. Vehicles are swerving into oncoming traffic to avoid rim damage. Needs urgent asphalt repair.',
      summary: 'Hazardous road pothole on Central Ave eastbound lane',
      createdBy: citizen1._id,
      category: catMap['road-potholes']._id,
      department: deptMap.ROAD,
      assignedOfficer: officerRoad._id,
      status: COMPLAINT_STATUS.IN_PROGRESS,
      priority: PRIORITIES.HIGH,
      location: {
        type: 'Point',
        coordinates: [-73.985131, 40.748817], // [lng, lat]
        address: '350 5th Ave, New York, NY 10118',
        landmark: 'Opposite Empire State Plaza',
      },
      images: [
        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      ],
      upvoteCount: 14,
      followerCount: 5,
      commentCount: 2,
    });

    // Status histories for Complaint 1
    await StatusHistory.create([
      {
        complaint: complaint1._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: citizen1._id,
        note: 'Complaint registered by citizen with photo evidence.',
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
      {
        complaint: complaint1._id,
        status: COMPLAINT_STATUS.UNDER_REVIEW,
        changedBy: adminUser._id,
        note: 'Reviewed and verified location hazard by Admin.',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        complaint: complaint1._id,
        status: COMPLAINT_STATUS.ASSIGNED,
        changedBy: adminUser._id,
        note: 'Assigned to Road Maintenance Officer Marcus Vance.',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        complaint: complaint1._id,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        changedBy: officerRoad._id,
        note: 'Road repair team dispatched with asphalt paving truck.',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ]);

    await Assignment.create({
      complaint: complaint1._id,
      officer: officerRoad._id,
      assignedBy: adminUser._id,
      status: ASSIGNMENT_STATUS.IN_PROGRESS,
      notes: 'High priority road surface fix. Coordinate road cone barriers.',
    });

    // Sample 2: Overflowing Garbage (Resolved)
    const complaint2 = await Complaint.create({
      complaintNumber: 'CH-2026-000002',
      title: 'Overflowing commercial waste dumpster blocking pedestrian walkway',
      description: 'The municipal dumpsters behind 8th Street market have been overflowing for 4 days. Waste is spilling onto the public sidewalk creating an intolerable stench and hygiene risk.',
      summary: 'Overflowing garbage bin on 8th Street',
      createdBy: citizen2._id,
      category: catMap['garbage-waste']._id,
      department: deptMap.WASTE,
      assignedOfficer: officerWaste._id,
      status: COMPLAINT_STATUS.RESOLVED,
      priority: PRIORITIES.MEDIUM,
      location: {
        type: 'Point',
        coordinates: [-73.991200, 40.730610],
        address: '8th St & Broadway, New York, NY 10003',
        landmark: 'Behind Farmers Market Entrance',
      },
      images: [
        'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=800&q=80',
      ],
      resolvedAt: new Date(Date.now() - 12 * 3600000),
      upvoteCount: 8,
      followerCount: 3,
      commentCount: 1,
    });

    await StatusHistory.create([
      {
        complaint: complaint2._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: citizen2._id,
        note: 'Reported with photos.',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        complaint: complaint2._id,
        status: COMPLAINT_STATUS.UNDER_REVIEW,
        changedBy: adminUser._id,
        note: 'Forwarded to waste management triage.',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        complaint: complaint2._id,
        status: COMPLAINT_STATUS.ASSIGNED,
        changedBy: adminUser._id,
        note: 'Assigned to Elena Rostova.',
        createdAt: new Date(Date.now() - 36 * 3600000),
      },
      {
        complaint: complaint2._id,
        status: COMPLAINT_STATUS.IN_PROGRESS,
        changedBy: officerWaste._id,
        note: 'Compactor truck en route.',
        createdAt: new Date(Date.now() - 20 * 3600000),
      },
      {
        complaint: complaint2._id,
        status: COMPLAINT_STATUS.RESOLVED,
        changedBy: officerWaste._id,
        note: 'Dumpster emptied, area power-washed and sanitized.',
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
    ]);

    // Sample 3: Water Main Leak (Under Review)
    const complaint3 = await Complaint.create({
      complaintNumber: 'CH-2026-000003',
      title: 'Pressurized water leaking from underground pipeline onto roadway',
      description: 'Continuous water stream bubbling up between paving stones near fire hydrant. Low pressure reported by adjacent residential apartments. Significant water loss.',
      summary: 'Water pipeline leak bubbling onto roadway',
      createdBy: citizen1._id,
      category: catMap['water-supply']._id,
      department: deptMap.WATER,
      status: COMPLAINT_STATUS.UNDER_REVIEW,
      priority: PRIORITIES.HIGH,
      location: {
        type: 'Point',
        coordinates: [-73.977200, 40.752700],
        address: 'Lexington Ave & 44th St, New York, NY 10017',
        landmark: 'Beside Grand Central East Exit',
      },
      images: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80',
      ],
      upvoteCount: 21,
      followerCount: 9,
      commentCount: 1,
    });

    await StatusHistory.create([
      {
        complaint: complaint3._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: citizen1._id,
        note: 'Water main leak submitted.',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        complaint: complaint3._id,
        status: COMPLAINT_STATUS.UNDER_REVIEW,
        changedBy: adminUser._id,
        note: 'Evaluating urgency with water division engineer.',
        createdAt: new Date(Date.now() - 10 * 3600000),
      },
    ]);

    // Sample 4: Broken Street Light (Submitted)
    const complaint4 = await Complaint.create({
      complaintNumber: 'CH-2026-000004',
      title: 'Dark street light pole #42 completely out for two weeks',
      description: 'Lamp post #42 on Elm street has been completely unlit, creating a dark pedestrian walkway near the bus shelter. Poses safety concerns at night.',
      summary: 'Street light out on Elm street',
      createdBy: citizen2._id,
      category: catMap['street-lights']._id,
      department: deptMap.PWD,
      status: COMPLAINT_STATUS.SUBMITTED,
      priority: PRIORITIES.LOW,
      location: {
        type: 'Point',
        coordinates: [-73.981400, 40.768100],
        address: 'Elm St & 58th St, New York, NY 10019',
        landmark: 'Near Central Park South Gate',
      },
      images: [
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
      ],
      upvoteCount: 3,
      followerCount: 1,
      commentCount: 0,
    });

    await StatusHistory.create([
      {
        complaint: complaint4._id,
        status: COMPLAINT_STATUS.SUBMITTED,
        changedBy: citizen2._id,
        note: 'New street light failure reported.',
        createdAt: new Date(),
      },
    ]);

    // 6. Comments, Votes, and Followers
    await Comment.create([
      {
        complaint: complaint1._id,
        user: citizen2._id,
        content: 'I hit this pothole yesterday on my bicycle, nearly fell off! Really glad someone reported it.',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        complaint: complaint1._id,
        user: officerRoad._id,
        content: 'Work order #RD-884 is scheduled for completion this afternoon. Temporary caution signage has been positioned.',
        createdAt: new Date(Date.now() - 12 * 3600000),
      },
      {
        complaint: complaint2._id,
        user: citizen1._id,
        content: 'Confirmed, the dumpsters are now clear and sidewalk is clean. Thank you!',
        createdAt: new Date(Date.now() - 6 * 3600000),
      },
    ]);

    await Vote.create([
      { complaint: complaint1._id, user: citizen1._id },
      { complaint: complaint1._id, user: citizen2._id },
      { complaint: complaint2._id, user: citizen1._id },
      { complaint: complaint3._id, user: citizen2._id },
    ]);

    await Follower.create([
      { complaint: complaint1._id, user: citizen1._id },
      { complaint: complaint1._id, user: citizen2._id },
      { complaint: complaint3._id, user: citizen1._id },
    ]);

    await Notification.create([
      {
        recipient: citizen1._id,
        type: NOTIFICATION_TYPES.STATUS_CHANGED,
        title: 'Status Updated: CH-2026-000001',
        message: 'Your complaint "Deep hazardous pothole" status was changed to IN_PROGRESS.',
        complaint: complaint1._id,
        isRead: false,
      },
      {
        recipient: citizen2._id,
        type: NOTIFICATION_TYPES.COMPLAINT_RESOLVED,
        title: 'Complaint Resolved: CH-2026-000002',
        message: 'Your complaint regarding overflowing dumpsters has been marked as RESOLVED.',
        complaint: complaint2._id,
        isRead: true,
      },
    ]);

    console.log('Seeding completed successfully!');
    console.log('\n--- Default Seed Credentials ---');
    console.log('Admin:   admin@complainthub.local    / Password@123');
    console.log('Officer: officer.road@complainthub.local / Password@123');
    console.log('Officer: officer.waste@complainthub.local / Password@123');
    console.log('Officer: officer.water@complainthub.local / Password@123');
    console.log('Citizen: citizen.john@complainthub.local / Password@123');
    console.log('Citizen: citizen.sarah@complainthub.local / Password@123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
