// ============================================
// BACKEND SETUP
// ============================================

// 1. backend/.env
/*
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ssb_db
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
*/

// 2. backend/config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

module.exports = promisePool;

// 3. backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/students', require('./routes/students'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/tracking', require('./routes/tracking'));

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-schedule', (scheduleId) => {
    socket.join(`schedule-${scheduleId}`);
  });

  socket.on('location-update', (data) => {
    io.to(`schedule-${data.scheduleId}`).emit('location-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 4. backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.user_type} is not authorized`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

// ============================================
// FRONTEND SETUP (Next.js)
// ============================================

// 1. frontend/.env.local
/*
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
*/

// 2. frontend/lib/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

// 3. frontend/context/AuthContext.js
'use client';
import { createContext, useState, useEffect, useContext } from 'react';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.data);
    
    // Redirect based on user type
    const redirectPath = {
      admin: '/admin',
      driver: '/driver',
      parent: '/parents'
    }[res.data.data.user_type];
    
    router.push(redirectPath);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// 4. frontend/app/layout.js (wrap với AuthProvider)
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// 5. frontend/hooks/useSocket.js
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return socket;
};

// 6. Cách sử dụng trong component
// frontend/app/admin/page.js
'use client';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await axios.get('/buses');
      setBuses(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.full_name}</p>
      {/* Display buses */}
    </div>
  );
}

// ============================================
// PACKAGE.JSON MẪU
// ============================================

// backend/package.json
/*
{
  "name": "ssb-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/

// frontend/package.json (thêm dependencies)
/*
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "axios": "^1.6.0",
    "socket.io-client": "^4.6.0",
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4"
  }
}
*/