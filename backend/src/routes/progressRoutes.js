// backend/src/routes/progressRoutes.js

const express = require('express');
const router = express.Router();
const { getUserProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// Protect this route—token must be sent
router.get('/', protect, getUserProgress);

module.exports = router;
