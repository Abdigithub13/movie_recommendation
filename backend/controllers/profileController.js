const pool = require('../db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userResult = await pool.query('SELECT id, username, email, preferences, profile_picture, created_at FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    // Fetch user ratings history
    const ratingsResult = await pool.query(
      `SELECT r.*, m.title, m.genre, m.year, m.director, m.poster_url
       FROM ratings r
       JOIN movies m ON r.movie_id = m.id
       WHERE r.user_id = $1
       ORDER BY r.timestamp DESC`,
      [userId]
    );
    const profile = userResult.rows[0];
    profile.ratings = ratingsResult.rows;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.', details: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, preferences } = req.body;
    const result = await pool.query(
      'UPDATE users SET username = $1, email = $2, preferences = $3 WHERE id = $4 RETURNING id, username, email, preferences',
      [username, email, preferences, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.', details: err.message });
  }
};
