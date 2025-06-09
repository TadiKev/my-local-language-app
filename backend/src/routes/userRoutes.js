// backend/src/routes/userRoutes.js

const express = require('express');
const router = express.Router();

// ① Import your controllers:
const { getProfile, updateProfile } = require('../controllers/userController');

// ② Import your auth middleware:
const { protect } = require('../middleware/authMiddleware');

// ③ Define the protected routes:
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
