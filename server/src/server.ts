import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daily Vault API is running!' });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Daily Vault API v1.0' });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint', status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ message: 'Login endpoint', status: 'ok' });
});

// Leaderboard endpoints
app.get('/api/leaderboard/daily', (req, res) => {
  res.json({ 
    leaderboard: [
      { rank: 1, username: 'Player1', score: 5000 },
      { rank: 2, username: 'Player2', score: 4500 },
      { rank: 3, username: 'Player3', score: 4000 }
    ]
  });
});

// Shop endpoints
app.get('/api/shop/cosmetics', (req, res) => {
  res.json({ 
    cosmetics: [
      { id: 1, name: 'Purple Card Back', price: 500 },
      { id: 2, name: 'Gold Avatar', price: 1000 }
    ]
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.emit('welcome', { message: 'Welcome to Daily Vault!' });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Daily Vault API running on port ${PORT}`);
});
