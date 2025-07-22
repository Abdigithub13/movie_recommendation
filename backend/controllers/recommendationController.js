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
    let recResult;
    if (preferredGenres.length) {
      recResult = await pool.query(
        `SELECT * FROM movies WHERE genre = ANY($1) AND id NOT IN (
          SELECT movie_id FROM ratings WHERE user_id = $2
        ) LIMIT 10`,
        [preferredGenres, userId]
      );
    }
    // Fallback: If no recommendations found, show top-rated movies not yet rated by user
    if (!recResult || recResult.rows.length === 0) {
      recResult = await pool.query(
        `SELECT m.*, COALESCE(AVG(r.rating),0) as avg_rating
         FROM movies m
         LEFT JOIN ratings r ON m.id = r.movie_id
         WHERE m.id NOT IN (SELECT movie_id FROM ratings WHERE user_id = $1)
         GROUP BY m.id
         ORDER BY avg_rating DESC, m.year DESC
         LIMIT 10`,
        [userId]
      );
    }
    // Final fallback: If still no movies, just show recent movies
    if (!recResult || recResult.rows.length === 0) {
      recResult = await pool.query(
        `SELECT * FROM movies ORDER BY year DESC LIMIT 10`
      );
    }
    res.json({ recommended: recResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendations.', details: err.message });
  }
};
