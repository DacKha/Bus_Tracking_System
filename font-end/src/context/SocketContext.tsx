'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { logger } from '@/utils/logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface LocationUpdate {
  schedule_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
  driver_name?: string;
}

interface NotificationData {
  notification_id: number;
  title: string;
  message: string;
  type: string;
  timestamp: string;
}

interface MessageData {
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  timestamp: string;
}

interface AttendanceUpdate {
  schedule_id: number;
  student_id: number;
  attendance_type: 'pickup' | 'dropoff';
  status: 'picked_up' | 'dropped_off';
  timestamp: string;
  driver_name?: string;
}

interface ScheduleStatusUpdate {
  schedule_id: number;
  status: string;
  updated_by: string;
  timestamp: string;
}

interface IncidentAlert {
  incident_id: number;
  schedule_id: number;
  incident_type: string;
  message: string;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  
  joinSchedule: (scheduleId: number) => void;
  leaveSchedule: (scheduleId: number) => void;
  sendLocationUpdate: (data: Omit<LocationUpdate, 'timestamp' | 'driver_name'>) => void;
  onLocationUpdate: (callback: (data: LocationUpdate) => void) => (() => void) | void;
  
  onNewNotification: (callback: (data: NotificationData) => void) => (() => void) | void;
  
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendMessage: (conversationId: number, messageText: string) => void;
  onNewMessage: (callback: (data: MessageData) => void) => (() => void) | void;
  
  sendAttendanceUpdate: (data: Omit<AttendanceUpdate, 'timestamp' | 'driver_name'>) => void;
  onAttendanceUpdate: (callback: (data: AttendanceUpdate) => void) => (() => void) | void;
  
  sendScheduleStatusUpdate: (scheduleId: number, status: string) => void;
  onScheduleStatusUpdate: (callback: (data: ScheduleStatusUpdate) => void) => (() => void) | void;
  
  reportIncident: (data: { incident_id: number; schedule_id: number; incident_type: string }) => void;
  onIncidentAlert: (callback: (data: IncidentAlert) => void) => (() => void) | void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      autoConnect: true
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('connect_error', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token, user]);

  const joinSchedule = useCallback((scheduleId: number) => {
    if (socket?.connected) {
      socket.emit('join-schedule', { schedule_id: scheduleId });
      logger.debug(`Joined schedule room: ${scheduleId}`);
    }
  }, [socket]);

  const leaveSchedule = useCallback((scheduleId: number) => {
    if (socket?.connected) {
      socket.emit('leave-schedule', { schedule_id: scheduleId });
    }
  }, [socket]);

  const sendLocationUpdate = useCallback((data: Omit<LocationUpdate, 'timestamp' | 'driver_name'>) => {
    if (socket?.connected) {
      socket.emit('location-update', data);
    }
  }, [socket]);

  const onLocationUpdate = useCallback((callback: (data: LocationUpdate) => void) => {
    if (!socket) return;

    socket.on('location-updated', callback);

    return () => {
      socket.off('location-updated', callback);
    };
  }, [socket]);

  const onNewNotification = useCallback((callback: (data: NotificationData) => void) => {
    if (!socket) return;

    socket.on('new-notification', callback);

    return () => {
      socket.off('new-notification', callback);
    };
  }, [socket]);

  const joinConversation = useCallback((conversationId: number) => {
    if (socket?.connected) {
      socket.emit('join-conversation', { conversation_id: conversationId });
      logger.debug(`Joined conversation: ${conversationId}`);
    }
  }, [socket]);

  const leaveConversation = useCallback((conversationId: number) => {
    if (socket?.connected) {
      socket.emit('leave-conversation', { conversation_id: conversationId });
      logger.debug(`Left conversation: ${conversationId}`);
    }
  }, [socket]);

  const sendMessage = useCallback((conversationId: number, messageText: string) => {
    if (socket?.connected) {
      socket.emit('send-message', {
        conversation_id: conversationId,
        message_text: messageText
      });
    }
  }, [socket]);

  const onNewMessage = useCallback((callback: (data: MessageData) => void) => {
    if (!socket) return;

    socket.on('new-message', callback);

    return () => {
      socket.off('new-message', callback);
    };
  }, [socket]);

  const sendAttendanceUpdate = useCallback((data: Omit<AttendanceUpdate, 'timestamp' | 'driver_name'>) => {
    if (socket?.connected) {
      socket.emit('student-attendance', data);
    }
  }, [socket]);

  const onAttendanceUpdate = useCallback((callback: (data: AttendanceUpdate) => void) => {
    if (!socket) return;

    socket.on('attendance-update', callback);

    return () => {
      socket.off('attendance-update', callback);
    };
  }, [socket]);

  const sendScheduleStatusUpdate = useCallback((scheduleId: number, status: string) => {
    if (socket?.connected) {
      socket.emit('schedule-status-update', {
        schedule_id: scheduleId,
        status
      });
    }
  }, [socket]);

  const onScheduleStatusUpdate = useCallback((callback: (data: ScheduleStatusUpdate) => void) => {
    if (!socket) return;

    socket.on('schedule-status-changed', callback);

    return () => {
      socket.off('schedule-status-changed', callback);
    };
  }, [socket]);

  const reportIncident = useCallback((data: { incident_id: number; schedule_id: number; incident_type: string }) => {
    if (socket?.connected) {
      socket.emit('incident-reported', data);
    }
  }, [socket]);

  const onIncidentAlert = useCallback((callback: (data: IncidentAlert) => void) => {
    if (!socket) return;

    socket.on('incident-alert', callback);

    return () => {
      socket.off('incident-alert', callback);
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    connected,
    joinSchedule,
    leaveSchedule,
    sendLocationUpdate,
    onLocationUpdate,
    onNewNotification,
    joinConversation,
    leaveConversation,
    sendMessage,
    onNewMessage,
    sendAttendanceUpdate,
    onAttendanceUpdate,
    sendScheduleStatusUpdate,
    onScheduleStatusUpdate,
    reportIncident,
    onIncidentAlert
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
