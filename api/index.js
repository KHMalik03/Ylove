// api/index.js (updated)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { flushAll } = require('./utils/cache');
const trackActivity = require('./middlewares/activityTracker');

// Load environment variables
dotenv.config();

const app = express();

// Import routes
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const authRoutes = require('./routes/auth.routes');
const matchingRoutes = require('./routes/matching.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const matchRoutes = require('./routes/match.routes');
const messageRoutes = require('./routes/message.routes');
const blockRoutes = require('./routes/block.routes');
const interestRoutes = require('./routes/intrest.routes');
const userInterestRoutes = require('./routes/userIntrest.routes');
const photoRoutes = require('./routes/photo.routes');
const reportRoutes = require('./routes/report.routes');
const swipeRoutes = require('./routes/swipe.routes');
const activityRoutes = require('./routes/activity.routes');
const adminRoutes = require('./routes/admin.routes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/userInterests', userInterestRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);

// Add activity tracking to authenticated routes
app.use('/api/users', trackActivity);
app.use('/api/profiles', trackActivity);
app.use('/api/matching', trackActivity);
app.use('/api/matches', trackActivity);
app.use('/api/messages', trackActivity);

// Cache management route
app.post('/api/admin/cache/flush', (req, res) => {
  try {
    flushAll();
    res.json({ success: true, message: 'Cache flushed successfully' });
  } catch (error) {
    console.error('Cache flush error:', error);
    res.status(500).json({ error: 'Failed to flush cache' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});