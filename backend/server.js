require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');

const connectDB = require('./config/db');
const initializeSocket = require('./config/socketConfig');
const setupSocketEvents = require('./socket/events.socket');
const errorHandler = require('./middleware/errorHandler.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const authRoutes = require('./routes/auth.routes');
const weekRoutes = require('./routes/week.routes');
const entryRoutes = require('./routes/entry.routes');
const userRoutes = require('./routes/user.routes');
const statusRoutes = require('./routes/status.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/', apiLimiter);

// Database connection
connectDB();

// Socket.io
const io = initializeSocket(server);
setupSocketEvents(io);
app.set('io', io);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'BuildSphere API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      weeks: '/api/weeks',
      entries: '/api/entries',
      users: '/api/users'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
