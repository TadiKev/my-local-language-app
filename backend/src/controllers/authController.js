// controllers/authController.js

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredLanguage } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  // Check for existing user
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('Email already in use');
  }

  // Create user (virtual setter for passwordHash will run)
  const user = new User({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    preferredLanguage: preferredLanguage || 'en',
  });
  user.password = password; // hashes via virtual setter

  await user.save();

  // Generate JWT
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  res.status(201).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
    },
    token,
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
    },
    token,
  });
});

module.exports = {
  register,
  login,
};
