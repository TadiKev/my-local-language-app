// backend/src/controllers/lessonController.js

const asyncHandler = require('express-async-handler');
const Lesson = require('../models/Lesson');
const path = require('path');
const fs = require('fs');

/**
 * @desc    Fetch all lessons (optionally filtered by languageCode or paginated)
 * @route   GET /api/lessons
 * @access  Public (no auth required)
 */
const getAllLessons = asyncHandler(async (req, res) => {
  const { languageCode, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (languageCode) {
    filter.languageCode = languageCode;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Lesson.countDocuments(filter);
  const lessons = await Lesson.find(filter)
    .sort({ order: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    lessons,
  });
});

/**
 * @desc    Fetch a single lesson by ID
 * @route   GET /api/lessons/:id
 * @access  Public
 */
const getLessonById = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  res.json(lesson);
});

/**
 * @desc    Create a new lesson (admin only)
 * @route   POST /api/lessons
 * @access  Private (admin)
 *
 * Expects multipart/form-data:
 *   - fields: title (string), languageCode (string), content (string), expectedText (string), description (string), order (number)
 *   - file   : audioExample  (optional)
 */
const createLesson = asyncHandler(async (req, res) => {
  // The `protect` middleware + role check was done in routes, so req.user.role === 'admin'

  const {
    title,
    description,
    languageCode,
    content,
    expectedText,
    order,
  } = req.body;

  if (!title || !languageCode) {
    res.status(400);
    throw new Error('Title and languageCode are required');
  }

  // Ensure unique title per language
  const exists = await Lesson.findOne({ title: title.trim(), languageCode });
  if (exists) {
    res.status(409);
    throw new Error('Lesson with this title already exists for that language');
  }

  // If Multer stored a file, it lives in req.file
  let audioUrl = '';
  if (req.file) {
    // Serve from /uploads/<filename>
    audioUrl = `/uploads/${req.file.filename}`;
  }

  const lesson = new Lesson({
    title: title.trim(),
    description: description ? description.trim() : '',
    languageCode,
    content: content || '',
    expectedText: expectedText || '',
    audioExampleUrl: audioUrl,
    order: order || 0,
  });

  await lesson.save();
  res.status(201).json(lesson);
});

/**
 * @desc    Update a lesson by ID (admin only)
 * @route   PUT /api/lessons/:id
 * @access  Private (admin)
 *
 * Supports multipart/form-data if replacing the audioExample.
 */
const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const {
    title,
    description,
    languageCode,
    content,
    expectedText,
    order,
  } = req.body;

  // If title changed, check uniqueness in same language
  if (title && title.trim() !== lesson.title) {
    const dup = await Lesson.findOne({
      title: title.trim(),
      languageCode: languageCode || lesson.languageCode,
      _id: { $ne: lesson._id },
    });
    if (dup) {
      res.status(409);
      throw new Error('Another lesson with this title exists for that language');
    }
    lesson.title = title.trim();
  }

  if (description !== undefined) {
    lesson.description = description.trim();
  }
  if (languageCode) {
    lesson.languageCode = languageCode;
  }
  if (content !== undefined) {
    lesson.content = content;
  }
  if (expectedText !== undefined) {
    lesson.expectedText = expectedText;
  }
  if (order !== undefined) {
    lesson.order = order;
  }

  // If Multer stored a new file, replace `audioExampleUrl` with `/uploads/<filename>`
  if (req.file) {
    lesson.audioExampleUrl = `/uploads/${req.file.filename}`;
  }

  await lesson.save();
  res.json(lesson);
});

/**
 * @desc    Delete a lesson by ID (admin only)
 * @route   DELETE /api/lessons/:id
 * @access  Private (admin)
 */
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }
  await lesson.deleteOne();
  res.json({ message: 'Lesson removed' });
});

/**
 * @desc    Delete only the audioExample file for a lesson (admin only)
 * @route   DELETE /api/lessons/:id/audio
 * @access  Private (admin)
 */
const deleteLessonAudio = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  // If there is an existing audioExampleUrl, remove the file from disk:
  if (lesson.audioExampleUrl) {
    // audioExampleUrl is like "/uploads/<filename>"
    const filename = lesson.audioExampleUrl.replace(/^\/uploads\//, '');
    const filePath = path.join(__dirname, '../../uploads', filename);

    // If the file exists, delete it
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Clear the field and save
  lesson.audioExampleUrl = '';
  await lesson.save();

  res.json({ message: 'Audio example deleted' });
});

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  deleteLessonAudio,
};
