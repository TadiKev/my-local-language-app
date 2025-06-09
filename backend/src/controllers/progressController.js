// backend/src/controllers/progressController.js
const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');

/**
 * @desc    Get all progress records for the current user
 * @route   GET /api/progress
 * @access  Private
 */
const getUserProgress = asyncHandler(async (req, res) => {
  // use authenticated user ID, ignore query param
  const userId = req.user.id;
  const records = await Progress.find({ user: userId })
    .populate('lesson', 'title languageCode')
    .sort({ lastAttempted: -1 });
  res.json(records);
});

module.exports = {
  getUserProgress,
};
