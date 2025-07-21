const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authenticateToken = require('../middleware/authMiddleware');

// Submit or update a rating for a movie (protected)
router.post('/', authenticateToken, ratingController.submitRating);
// Get all ratings for a movie
router.get('/:movieId', ratingController.getRatingsForMovie);
// Get all ratings by a user
router.get('/user/:userId', ratingController.getRatingsByUser);

module.exports = router;
