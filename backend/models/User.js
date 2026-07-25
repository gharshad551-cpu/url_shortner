const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  refreshTokens: [String],
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  apiKeyCreatedAt: {
    type: Date,
    default: null
  },
  apiKeyLastUsed: {
    type: Date,
    default: null
  },
  apiKeyRequestCount: {
    type: Number,
    default: 0
  },
  apiKeyRateLimit: {
    type: Number,
    default: 1000
  },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
