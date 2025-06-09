
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // e.g. 0–100 (percentage), or a custom score
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAttempted: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent duplicates: one progress per (user, lesson)
progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
