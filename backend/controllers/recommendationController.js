const pool = require("../db");

// Simple content-based recommendation: recommend movies from user's preferred genres or genres they've rated highly
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Get user preferences from user_preferences table
    let preferredGenres = [];
    const prefResult = await pool.query(
      "SELECT preferred_genres FROM user_preferences WHERE user_id = $1",
      [userId]
    );
    if (prefResult.rows.length && prefResult.rows[0].preferred_genres) {
      // If preferred_genres is a comma-separated string, split it
      preferredGenres = prefResult.rows[0].preferred_genres
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean);
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
      preferredGenres = ratingResult.rows.map((r) => r.genre);
    }
    let recResult;
    if (preferredGenres.length) {
      recResult = await pool.query(
        `SELECT m.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.rating) as rating_count
         FROM movies m
         LEFT JOIN ratings r ON m.id = r.movie_id
         WHERE m.genre = ANY($1)
         GROUP BY m.id
         HAVING COALESCE(AVG(r.rating),0) > 7
         ORDER BY avg_rating DESC, m.year DESC
         LIMIT 10`,
        [preferredGenres]
      );
    }
    // Fallback: If no recommendations found, show top-rated movies not yet rated by user
    if (!recResult || recResult.rows.length === 0) {
      recResult = await pool.query(
        `SELECT m.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.rating) as rating_count
         FROM movies m
         LEFT JOIN ratings r ON m.id = r.movie_id
         GROUP BY m.id
         HAVING COALESCE(AVG(r.rating),0) > 7
         ORDER BY avg_rating DESC, m.year DESC
         LIMIT 10`
      );
    }
    // Final fallback: If still no movies, just show recent movies (with avg_rating)
    if (!recResult || recResult.rows.length === 0) {
      recResult = await pool.query(
        `SELECT m.*, COALESCE(AVG(r.rating),0) as avg_rating, COUNT(r.rating) as rating_count
         FROM movies m
         LEFT JOIN ratings r ON m.id = r.movie_id
         GROUP BY m.id
         ORDER BY m.year DESC
         LIMIT 10`
      );
    }
    res.json({ recommended: recResult.rows });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to get recommendations.", details: err.message });
  }
};
