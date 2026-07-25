const rateLimit = require('express-rate-limit');

// Rate limiter for URL shortening
const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: { message: "Too many URLs created from this IP, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for Login/OTP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many authentication attempts, please try again later" },
});

module.exports = { shortenLimiter, authLimiter };
