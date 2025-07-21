const pool = require('../db');

// Simple content-based recommendation: recommend movies from user's preferred genres or genres they've rated highly
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get user preferences
    const userResult = await pool.query('SELECT preferences FROM users WHERE id = $1', [userId]);
    let preferredGenres = [];
    if (userResult.rows.length && userResult.rows[0].preferences) {
      const prefs = userResult.rows[0].preferences;
      if (prefs.preferred_genres) preferredGenres = prefs.preferred_genres;
    }
    // If no explicit preferences, infer from ratings
    if (!preferredGenres.length) {
      const ratingResult = await pool.query(
        `SELECT m.genre, COUNT(*) as count
         FROM ratings r
         JOIN movies m ON r.movie_id = m.id
         WHERE r.user_id = $1 AND r.rating >= 4
         GROUP BY m.genre
         ORDER BY count DESC
         LIMIT 3`,
        [userId]
      );
      preferredGenres = ratingResult.rows.map(r => r.genre);
    }
    // Recommend movies from preferred genres not yet rated by user
    const recResult = await pool.query(
      `SELECT * FROM movies WHERE genre = ANY($1) AND id NOT IN (
        SELECT movie_id FROM ratings WHERE user_id = $2
      ) LIMIT 10`,
      [preferredGenres, userId]
    );
    res.json({ recommended: recResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendations.', details: err.message });
  }
};
