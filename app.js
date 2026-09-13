const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Message = require('./models/Message');
const workspaceRoutes = require('./routes/workspaceRoutes');
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applicationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your friend's Vite port
    credentials: true,
  },
});

const PORT = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/devsync';

mongoose
  .connect(mongoURI)
  .then(() => console.log('🚀 MongoDB Connected Successfully'))
  .catch((err) => console.error('Database Connection Failed:', err));

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/workspace', workspaceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Socket.io Real-Time Group Chat Logic
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins a project room
  socket.on('join_project_room', (projectId) => {
    socket.join(projectId);
    console.log(`👤 Socket ${socket.id} joined room: ${projectId}`);
  });
// User sends a message
socket.on('send_message', async (data) => {
  try {
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

    const savedMessage = await Message.create({
      projectId: parsedData.projectId,
      sender: parsedData.sender,
      senderName: parsedData.senderName,
      text: parsedData.text,
    });

    // Broadcast message to everyone in the project room
    io.to(parsedData.projectId).emit('receive_message', savedMessage);
  } catch (err) {
    console.error('Socket message save error:', err);
  }
});

  socket.on('disconnect', () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// Listen on the HTTP Server instance
server.listen(PORT, () => console.log(`🔥 Server + Socket.io running on port ${PORT}`));