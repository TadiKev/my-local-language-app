// backend/src/models/Lesson.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    languageCode: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    // ──────────────────────────────────────────────────────────────────────
    // This is the exact phrase/words the student should speak
    expectedText: {
      type: String,
      required: true,
      trim: true,
      default: '', // you’ll override this when creating each lesson
    },
    // ──────────────────────────────────────────────────────────────────────
    audioExampleUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);
