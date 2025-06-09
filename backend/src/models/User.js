const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'shona', 'ndebele', 'kalanga', 'venda', 'sotho-tonga'],
      default: 'en',
    },
    // Optional: track overall progress percentage or role flags
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual field to set password (hashes it):
userSchema
  .virtual('password')
  .set(function (password) {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    this._password = password;
    this.passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
  })
  .get(function () {
    return this._password;
  });

// Instance method to compare a plaintext password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
