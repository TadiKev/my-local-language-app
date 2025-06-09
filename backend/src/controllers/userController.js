// backend/src/controllers/userController.js

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  // req.user is populated by protect middleware
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(user);
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.preferredLanguage = req.body.preferredLanguage || user.preferredLanguage;
  // (Do NOT allow role changes here unless admin)

  const updatedUser = await user.save();

  res.status(200).json({
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    preferredLanguage: updatedUser.preferredLanguage,
    role: updatedUser.role,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
