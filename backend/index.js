require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const ratingRoutes = require('./routes/ratings');
const profileRoutes = require('./routes/profile');
const profilePictureRoutes = require('./routes/profile_picture');
const recommendationsRoutes = require('./routes/recommendations');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profile/picture', profilePictureRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// Database health check endpoint
app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Database connection successful!' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
