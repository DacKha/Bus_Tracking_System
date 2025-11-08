const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

// Import config
const { testConnection } = require('./config/database');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const driverRoutes = require('./routes/drivers');
const parentRoutes = require('./routes/parents');
const studentRoutes = require('./routes/students');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const scheduleRoutes = require('./routes/schedules');
const trackingRoutes = require('./routes/tracking');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const incidentRoutes = require('./routes/incidents');
const dashboardRoutes = require('./routes/dashboard');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with proper configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io accessible to routes and controllers
app.set('io', io);

// Initialize Socket.IO handlers with authentication
const { initializeSocket } = require('./socket');
initializeSocket(io);

// ===========================================
// MIDDLEWARES
// ===========================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request timestamp
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ===========================================
// ROUTES
// ===========================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SSB Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Smart School Bus Tracking System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      drivers: '/api/drivers',
      parents: '/api/parents',
      students: '/api/students',
      buses: '/api/buses',
      routes: '/api/routes',
      schedules: '/api/schedules',
      tracking: '/api/tracking',
      notifications: '/api/notifications',
      messages: '/api/messages',
      incidents: '/api/incidents',
      dashboard: '/api/dashboard'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ===========================================
// ERROR HANDLERS
// ===========================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ===========================================
// START SERVER
// ===========================================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    console.log('===========================================');
    console.log('Khoi dong Server Backend Smart School Bus...');
    console.log('===========================================');

    // Kiem tra ket noi database
    console.log('Dang kiem tra ket noi database...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Loi: Khong the ket noi database');
      console.error('Vui long kiem tra file .env va cau hinh database');
      process.exit(1);
    }

    console.log('Ket noi database thanh cong');

    // Khoi dong server
    server.listen(PORT, HOST, () => {
      console.log('===========================================');
      console.log(`Server dang chay thanh cong!`);
      console.log(`Host: ${HOST}`);
      console.log(`Port: ${PORT}`);
      console.log(`Moi truong: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`Database: ${process.env.DB_NAME || 'ssb_db'}`);
      console.log(`Socket.IO: duoc kich hoat`);
      console.log(`Kiem tra suc khoe: http://localhost:${PORT}/health`);
      console.log(`API Docs: http://localhost:${PORT}/`);
      console.log('===========================================');
      console.log('Server san sang nhan ket noi');
      console.log('===========================================');
    });
  } catch (error) {
    console.error('===========================================');
    console.error('Loi: Khong the khoi dong server');
    console.error('===========================================');
    console.error(error);
    process.exit(1);
  }
};

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} signal nhan duoc: dang dong server HTTP..`);

  server.close(() => {
    console.log('HTTP server da dong');

    // Dong tat ca ket noi socket
    io.close(() => {
      console.log('Socket.IO connections da dong');
    });

    // Dong ket noi database
    console.log('Da tat tat ca ket noi');
    process.exit(0);
  });

  // Buoc dong sau 10 giay
  setTimeout(() => {
    console.error('Buoc dong bat buoc sau timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('===========================================');
  console.error('LOI: UNHANDLED PROMISE REJECTION');
  console.error('===========================================');
  console.error(err);
  console.error('===========================================');

  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('===========================================');
  console.error('LOI: UNCAUGHT EXCEPTION');
  console.error('===========================================');
  console.error(err);
  console.error('===========================================');

  process.exit(1);
});

// Start the server
startServer();

module.exports = { app, io, server };
