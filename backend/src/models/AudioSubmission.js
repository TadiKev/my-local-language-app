
const mongoose = require('mongoose');

const audioSubmissionSchema = new mongoose.Schema(
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
    // URL to the audio file (e.g. uploaded to S3, Cloudinary, local disk)
    audioUrl: {
      type: String,
      required: [true, 'Audio URL is required'],
      trim: true,
    },
    // If your backend runs speech-to-text, store the transcript here
    transcript: {
      type: String,
      default: '',
      trim: true,
    },
    // For example: phoneme‑accuracy or % match against the “answer key”
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
      // e.g. “Your pronunciation of ‘r’ was weak. Try rolling your r.”
    },
  },
  {
    timestamps: true,
  }
);

// If you want to fetch “all submissions for a user on a lesson” quickly:
audioSubmissionSchema.index({ user: 1, lesson: 1 });

module.exports = mongoose.model('AudioSubmission', audioSubmissionSchema);
