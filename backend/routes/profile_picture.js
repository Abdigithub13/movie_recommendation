const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authenticateToken = require('../middleware/authMiddleware');
const pool = require('../db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'user_' + req.user.userId + '_' + Date.now() + ext);
  },
});

const upload = multer({ storage });

// POST /api/profile/picture
router.post('/', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const userId = req.user.userId;
    // Save relative path for frontend
    const fileUrl = `/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [fileUrl, userId]);
    res.json({ success: true, profile_picture: fileUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload profile picture.', details: err.message });
  }
});

module.exports = router;
