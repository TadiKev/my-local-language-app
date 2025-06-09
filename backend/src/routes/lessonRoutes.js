// backend/src/routes/lessonRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  deleteLessonAudio, // <-- import the new controller
} = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');

// Ensure backend/uploads exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage (all lesson files go into backend/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `lessonAudio-${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Public routes (no auth):
router.get('/', getAllLessons);
router.get('/:id', getLessonById);

// Admin‐only: create, update, delete lessons
router.post(
  '/',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Admin access required'));
    }
    next();
  },
  upload.single('audioExample'),
  createLesson
);

router.put(
  '/:id',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Admin access required'));
    }
    next();
  },
  upload.single('audioExample'),
  updateLesson
);

router.delete(
  '/:id',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Admin access required'));
    }
    next();
  },
  deleteLesson
);

// ─── NEW: Admin can delete just the audioExample ────────────────────────
router.delete(
  '/:id/audio',
  protect,
  (req, res, next) => {
    if (req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Admin access required'));
    }
    next();
  },
  deleteLessonAudio
);

module.exports = router;
