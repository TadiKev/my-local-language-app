const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

const AudioSubmission = require('../models/AudioSubmission');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const levenshtein = require('../utils/levenshtein');

/**
 * Helper: normalize a string to remove punctuation, lowercase, collapse spaces
 */
function normalizeText(str = '') {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip punctuation
    .replace(/\s+/g, ' ')        // collapse multiple spaces
    .trim();
}

/**
 * @desc    Create a new audio submission, compute dynamic score & feedback,
 *          then update or create a Progress record.
 * @route   POST /api/voice/submit
 * @access  Private
 */
const submitAudio = asyncHandler(async (req, res) => {
  // 1) Ensure protect() ran
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  // 2) Check that Multer stored a file
  if (!req.file) {
    res.status(400);
    throw new Error('No audio file uploaded');
  }

  const { lessonId, transcript } = req.body;
  if (!lessonId) {
    res.status(400);
    throw new Error('lessonId is required');
  }

  // 3) Fetch the lesson to get its expectedText (fallback to content if empty)
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    res.status(404);
    throw new Error('Lesson not found');
  }

  const rawExpected = lesson.expectedText?.trim()
    ? lesson.expectedText
    : lesson.content || '';
  const expectedNorm = normalizeText(rawExpected);
  const actualNorm = normalizeText(transcript || '');

  // 4) Compute Levenshtein distance between actualNorm and expectedNorm
  const distance = levenshtein(actualNorm, expectedNorm);
  const maxLen = Math.max(expectedNorm.length, actualNorm.length);
  let scorePercentage = 0;
  if (maxLen > 0) {
    scorePercentage = Math.round(((maxLen - distance) / maxLen) * 100);
    if (scorePercentage < 0) scorePercentage = 0;
  }

  // 5) Generate feedback based on scorePercentage
  let feedback;
  if (scorePercentage >= 90) {
    feedback = 'Excellent pronunciation!';
  } else if (scorePercentage >= 75) {
    feedback = 'Good job! Just a few small differences.';
  } else if (scorePercentage >= 50) {
    feedback = 'Not bad, but you can improve your pronunciation.';
  } else {
    feedback = 'Keep practicing to get closer to the expected phrase.';
  }

  // 6) Build the public URL for the stored file
  const audioUrl = `/uploads/${req.file.filename}`;

  // 7) Save the AudioSubmission document
  const newSubmission = new AudioSubmission({
    user: req.user.id,
    lesson: lessonId,
    audioUrl,
    transcript: transcript || '',
    score: scorePercentage,
    feedback,
    submittedAt: Date.now(),
  });
  await newSubmission.save();

  // 8) Update or create the Progress record
  const existingProgress = await Progress.findOne({
    user: req.user.id,
    lesson: lessonId,
  });

  if (existingProgress) {
    existingProgress.lastAttempted = Date.now();
    if (scorePercentage >= 80) {
      existingProgress.completed = true;
      existingProgress.score = Math.max(existingProgress.score, scorePercentage);
    } else {
      existingProgress.score = Math.max(existingProgress.score, scorePercentage);
    }
    await existingProgress.save();
  } else {
    await Progress.create({
      user: req.user.id,
      lesson: lessonId,
      completed: scorePercentage >= 80,
      score: scorePercentage,
      lastAttempted: Date.now(),
    });
  }

  // 9) Return the newly created submission
  res.status(201).json(newSubmission);
});

/**
 * @desc    Get all audio submissions for the current user (optional: filter by lesson)
 * @route   GET /api/voice/submissions
 * @access  Private
 */
const getUserSubmissions = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const { lessonId } = req.query;
  const filter = { user: req.user.id };
  if (lessonId) {
    filter.lesson = lessonId;
  }

  const submissions = await AudioSubmission.find(filter)
    .sort({ submittedAt: -1 })
    .populate('lesson', 'title languageCode');

  res.json(submissions);
});

/**
 * @desc    Admin: get all submissions for a given lesson (or all by all users)
 * @route   GET /api/voice/all
 * @access  Private (admin only)
 */
const getAllSubmissions = asyncHandler(async (req, res) => {
  const { lessonId, userId } = req.query;
  const filter = {};
  if (lessonId) filter.lesson = lessonId;
  if (userId) filter.user = userId;

  const submissions = await AudioSubmission.find(filter)
    .sort({ submittedAt: -1 })
    .populate('user', 'name email')
    .populate('lesson', 'title languageCode');

  res.json(submissions);
});

/**
 * @desc    Delete a specific audio submission (and remove its file)
 * @route   DELETE /api/voice/submissions/:id
 * @access  Private (owner or admin)
 */
const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await AudioSubmission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Only allow deletion if user is the owner or an admin
  if (
    submission.user.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this submission');
  }

  // Remove the file from disk (if it exists)
  if (submission.audioUrl) {
    // submission.audioUrl is like "/uploads/<filename>"
    const filename = submission.audioUrl.replace(/^\/uploads\//, '');
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Delete the document
  await submission.deleteOne();
  res.json({ message: 'Submission removed' });
});

// Export all handlers
module.exports = {
  submitAudio,
  getUserSubmissions,
  getAllSubmissions,
  deleteSubmission,
};
