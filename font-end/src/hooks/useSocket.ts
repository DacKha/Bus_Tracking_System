import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Custom hook de ket noi Socket.IO va quan ly real-time events
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Tao ket noi Socket.IO
    const socketIo = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Ket noi thanh cong
    socketIo.on('connect', () => {
      console.log('Socket.IO da ket noi');
    });

    // Loi ket noi
    socketIo.on('error', (error) => {
      console.error('Loi Socket.IO:', error);
    });

    // Ngat ket noi
    socketIo.on('disconnect', () => {
      console.log('Socket.IO da ngat ket noi');
    });

    setSocket(socketIo);

    // Cleanup khi component unmount
    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};
