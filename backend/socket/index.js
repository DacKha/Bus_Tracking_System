const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

/**
 * Initialize Socket.IO
 * @param {Server} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // Attach user info to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.full_name} (${socket.user.role}) - Socket ID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user-${socket.user.user_id}`);
    
    // Join role-specific room
    socket.join(`role-${socket.user.role}`);

    // ==================== BUS TRACKING EVENTS ====================
    
    /**
     * Driver joins schedule room to broadcast location
     * @event join-schedule
     * @param {Object} data - { schedule_id }
     */
    socket.on('join-schedule', (data) => {
      const { schedule_id } = data;
      if (schedule_id) {
        socket.join(`schedule-${schedule_id}`);
        console.log(`🚌 User ${socket.user.user_id} joined schedule room: schedule-${schedule_id}`);
        socket.emit('schedule-joined', { schedule_id, success: true });
      }
    });

    /**
     * Leave schedule room
     * @event leave-schedule
     * @param {Object} data - { schedule_id }
     */
    socket.on('leave-schedule', (data) => {
      const { schedule_id } = data;
      if (schedule_id) {
        socket.leave(`schedule-${schedule_id}`);
        console.log(`🚌 User ${socket.user.user_id} left schedule room: schedule-${schedule_id}`);
        socket.emit('schedule-left', { schedule_id, success: true });
      }
    });

    /**
     * Driver broadcasts real-time location
     * @event location-update
     * @param {Object} data - { schedule_id, latitude, longitude, speed, heading, accuracy, timestamp }
     */
    socket.on('location-update', (data) => {
      const { schedule_id, latitude, longitude, speed, heading, accuracy } = data;
      
      if (!schedule_id || !latitude || !longitude) {
        socket.emit('location-error', { message: 'Missing required location data' });
        return;
      }

      // Broadcast to all clients watching this schedule (parents, admin)
      io.to(`schedule-${schedule_id}`).emit('location-updated', {
        schedule_id,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: accuracy || 0,
        timestamp: new Date().toISOString(),
        driver_name: socket.user.full_name
      });

      console.log(`📍 Location update for schedule ${schedule_id}: [${latitude}, ${longitude}]`);
    });

    /**
     * Request current location of a schedule
     * @event request-location
     * @param {Object} data - { schedule_id }
     */
    socket.on('request-location', async (data) => {
      const { schedule_id } = data;
      
      // Emit request to drivers in that schedule room
      io.to(`schedule-${schedule_id}`).emit('location-request', { 
        schedule_id,
        requester: socket.user.user_id 
      });
    });

    // ==================== NOTIFICATION EVENTS ====================

    /**
     * Mark notification as read
     * @event notification-read
     * @param {Object} data - { notification_id }
     */
    socket.on('notification-read', (data) => {
      const { notification_id } = data;
      socket.emit('notification-marked-read', { notification_id, success: true });
    });

    /**
     * Send notification to specific user (called from backend)
     * This is typically called from controllers, not from client
     */
    // io.to(`user-${user_id}`).emit('new-notification', notificationData);

    // ==================== MESSAGE/CHAT EVENTS ====================

    /**
     * Join conversation room
     * @event join-conversation
     * @param {Object} data - { conversation_id }
     */
    socket.on('join-conversation', (data) => {
      const { conversation_id } = data;
      if (conversation_id) {
        socket.join(`conversation-${conversation_id}`);
        console.log(`💬 User ${socket.user.user_id} joined conversation: ${conversation_id}`);
        socket.emit('conversation-joined', { conversation_id, success: true });
      }
    });

    /**
     * Leave conversation room
     * @event leave-conversation
     * @param {Object} data - { conversation_id }
     */
    socket.on('leave-conversation', (data) => {
      const { conversation_id } = data;
      if (conversation_id) {
        socket.leave(`conversation-${conversation_id}`);
        console.log(`💬 User ${socket.user.user_id} left conversation: ${conversation_id}`);
      }
    });

    /**
     * Send message in real-time
     * @event send-message
     * @param {Object} data - { conversation_id, message_text }
     */
    socket.on('send-message', (data) => {
      const { conversation_id, message_text } = data;
      
      if (!conversation_id || !message_text) {
        socket.emit('message-error', { message: 'Missing required message data' });
        return;
      }

      // Broadcast to all users in conversation
      io.to(`conversation-${conversation_id}`).emit('new-message', {
        conversation_id,
        sender_id: socket.user.user_id,
        sender_name: socket.user.full_name,
        message_text,
        timestamp: new Date().toISOString()
      });

      console.log(`💬 New message in conversation ${conversation_id} from ${socket.user.full_name}`);
    });

    /**
     * Typing indicator
     * @event typing
     * @param {Object} data - { conversation_id }
     */
    socket.on('typing', (data) => {
      const { conversation_id } = data;
      socket.to(`conversation-${conversation_id}`).emit('user-typing', {
        conversation_id,
        user_id: socket.user.user_id,
        user_name: socket.user.full_name
      });
    });

    /**
     * Stop typing indicator
     * @event stop-typing
     * @param {Object} data - { conversation_id }
     */
    socket.on('stop-typing', (data) => {
      const { conversation_id } = data;
      socket.to(`conversation-${conversation_id}`).emit('user-stopped-typing', {
        conversation_id,
        user_id: socket.user.user_id
      });
    });

    // ==================== SCHEDULE STATUS EVENTS ====================

    /**
     * Schedule status changed (driver updates status)
     * @event schedule-status-update
     * @param {Object} data - { schedule_id, status }
     */
    socket.on('schedule-status-update', (data) => {
      const { schedule_id, status } = data;
      
      // Broadcast to all users watching this schedule
      io.to(`schedule-${schedule_id}`).emit('schedule-status-changed', {
        schedule_id,
        status,
        updated_by: socket.user.full_name,
        timestamp: new Date().toISOString()
      });

      console.log(`📅 Schedule ${schedule_id} status changed to: ${status}`);
    });

    // ==================== INCIDENT EVENTS ====================

    /**
     * New incident reported
     * @event incident-reported
     * @param {Object} data - { incident_id, schedule_id, incident_type }
     */
    socket.on('incident-reported', (data) => {
      const { incident_id, schedule_id, incident_type } = data;
      
      // Notify admin
      io.to('role-admin').emit('new-incident', {
        incident_id,
        schedule_id,
        incident_type,
        reported_by: socket.user.full_name,
        timestamp: new Date().toISOString()
      });

      // Notify users watching this schedule
      if (schedule_id) {
        io.to(`schedule-${schedule_id}`).emit('incident-alert', {
          incident_id,
          schedule_id,
          incident_type,
          message: `Sự cố mới: ${incident_type}`
        });
      }

      console.log(`🚨 New incident reported: ${incident_type} by ${socket.user.full_name}`);
    });

    /**
     * Incident status updated (admin resolves/updates)
     * @event incident-status-update
     * @param {Object} data - { incident_id, status, resolution }
     */
    socket.on('incident-status-update', (data) => {
      const { incident_id, status, resolution } = data;
      
      // Broadcast to all admin users
      io.to('role-admin').emit('incident-updated', {
        incident_id,
        status,
        resolution,
        updated_by: socket.user.full_name,
        timestamp: new Date().toISOString()
      });

      console.log(`🚨 Incident ${incident_id} status updated to: ${status}`);
    });

    // ==================== STUDENT ATTENDANCE EVENTS ====================

    /**
     * Student pickup/dropoff event
     * @event student-attendance
     * @param {Object} data - { schedule_id, student_id, attendance_type, status }
     */
    socket.on('student-attendance', (data) => {
      const { schedule_id, student_id, attendance_type, status } = data;
      
      // Notify parents of this student
      // Note: We need to get parent_id from database, this is a simplified version
      io.to(`schedule-${schedule_id}`).emit('attendance-update', {
        schedule_id,
        student_id,
        attendance_type, // 'pickup' or 'dropoff'
        status, // 'picked_up', 'dropped_off'
        timestamp: new Date().toISOString(),
        driver_name: socket.user.full_name
      });

      console.log(`👨‍🎓 Student ${student_id} attendance: ${attendance_type} - ${status}`);
    });

    // ==================== DISCONNECT EVENT ====================

    socket.on('disconnect', (reason) => {
      console.log(`❌ User disconnected: ${socket.user.full_name} - Reason: ${reason}`);
    });

    // ==================== ERROR HANDLING ====================

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });

  return io;
};

/**
 * Helper function to emit notification to specific user
 * Can be called from controllers
 */
const emitNotificationToUser = (io, user_id, notification) => {
  io.to(`user-${user_id}`).emit('new-notification', notification);
};

/**
 * Helper function to emit notification to all users with specific role
 */
const emitNotificationToRole = (io, role, notification) => {
  io.to(`role-${role}`).emit('new-notification', notification);
};

/**
 * Helper function to emit location update (called from trackingController)
 */
const emitLocationUpdate = (io, schedule_id, locationData) => {
  io.to(`schedule-${schedule_id}`).emit('location-updated', locationData);
};

module.exports = {
  initializeSocket,
  emitNotificationToUser,
  emitNotificationToRole,
  emitLocationUpdate
};
