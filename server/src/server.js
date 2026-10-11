const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { successResponse } = require('./utils/apiResponse');

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid friction
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// General Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads for local storage fallback
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  return successResponse(res, 200, 'ComplaintHub API is healthy and operational', {
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root API test
app.get('/api/v1', (req, res) => {
  return successResponse(res, 200, 'ComplaintHub API v1');
});

// Mount routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const departmentRoutes = require('./routes/department.routes');
const complaintRoutes = require('./routes/complaint.routes');
const commentRoutes = require('./routes/comment.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/comments', commentRoutes);
const attachmentRoutes = require('./routes/attachment.routes');
app.use('/api/v1/complaints/:id/attachments', attachmentRoutes);

// Standalone attachment delete
const { deleteAttachment } = require('./controllers/attachment.controller');
const { protect } = require('./middleware/auth.middleware');
app.delete('/api/v1/attachments/:id', protect, deleteAttachment);

app.use('/api/v1/notifications', notificationRoutes);

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`[ComplaintHub Server] Running on http://localhost:${PORT}`);
      console.log(`[ComplaintHub Server] Health check at http://localhost:${PORT}/api/v1/health`);
    });
  });
}

module.exports = app;
