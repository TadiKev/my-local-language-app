const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  submitAudio,
  getUserSubmissions,
  getAllSubmissions,
  deleteSubmission,
} = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

// 1) Configure Multer to write into backend/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // __dirname = backend/src/routes, so go up two levels to backend/uploads
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// 2) Submit a new audio file (must be authenticated)
router.post('/submit', protect, upload.single('audio'), submitAudio);

// 3) Get the current user’s submissions
router.get('/submissions', protect, getUserSubmissions);

// 4) Admin‐only: list all submissions (filterable via query params)
router.get(
  '/all',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Admin access required'));
    }
    next();
  },
  getAllSubmissions
);

// 5) Delete a single submission (owner or admin)
router.delete(
  '/submissions/:id',
  protect,
  deleteSubmission
);

module.exports = router;
