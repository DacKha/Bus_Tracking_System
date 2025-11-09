import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Custom hook để kết nối Socket.IO và quản lý real-time events
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Tạo kết nối Socket.IO
    const socketIo = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Kết nối thành công
    socketIo.on('connect', () => {
      console.log('Socket.IO đã kết nối');
    });

    // Lỗi kết nối
    socketIo.on('error', (error) => {
      console.error('Lỗi Socket.IO:', error);
    });

    // Ngắt kết nối
    socketIo.on('disconnect', () => {
      console.log('Socket.IO đã ngắt kết nối');
    });

    setSocket(socketIo);

    // Cleanup khi component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};
