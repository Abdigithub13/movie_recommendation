const pool = require('../db');

exports.getAllMovies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies.', details: err.message });
  }
};

exports.getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie.', details: err.message });
  }
};

exports.addMovie = async (req, res) => {
  const { title, genre, year, director, description, poster_url } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO movies (title, genre, year, director, description, poster_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, genre, year, director, description, poster_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add movie.', details: err.message });
  }
};

exports.searchMovies = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required.' });
  }
  try {
    const result = await pool.query(
      `SELECT * FROM movies WHERE 
        LOWER(title) LIKE LOWER($1) OR 
        LOWER(genre) LIKE LOWER($1) OR 
        LOWER(director) LIKE LOWER($1)
        ORDER BY id DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search movies.', details: err.message });
  }
};
