const pool = require('../db');

exports.submitRating = async (req, res) => {
  const { user_id, movie_id, rating } = req.body;
  if (!user_id || !movie_id || !rating) {
    return res.status(400).json({ error: 'user_id, movie_id, and rating are required.' });
  }
  if (rating < 1 || rating > 10) {
    return res.status(400).json({ error: 'Rating must be between 1 and 10.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO ratings (user_id, movie_id, rating, timestamp)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, movie_id)
       DO UPDATE SET rating = EXCLUDED.rating, timestamp = NOW()
       RETURNING *`,
      [user_id, movie_id, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit rating.', details: err.message });
  }
};

exports.getRatingsForMovie = async (req, res) => {
  const { movieId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM ratings WHERE movie_id = $1', [movieId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings.', details: err.message });
  }
};

exports.getRatingsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM ratings WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user ratings.', details: err.message });
  }
};
