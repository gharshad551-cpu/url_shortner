const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "15m", // Short lived
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d", // Long lived
  });
};

const logAudit = async (action, userEmail, status, ipAddress, details) => {
  try {
    await AuditLog.create({ action, userEmail, status, ipAddress, details });
  } catch (e) {
    console.error("Audit log error:", e);
  }
};

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ email, password });
    if (user) {
      await logAudit('REGISTER', email, 'success', req.ip, 'User registered successfully');
      res.status(201).json({ message: "User registered. Please log in." });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push(refreshToken);
      await user.save();

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      await logAudit('LOGIN', email, 'success', req.ip, 'User logged in successfully');

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateAccessToken(user._id)
      });
    } else {
      await logAudit('LOGIN_ATTEMPT', email || 'unknown', 'failure', req.ip, 'Invalid credentials');
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.googleAuth = async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ message: "No access token provided" });
  }

  try {
    // Verify access token by fetching user profile
    const axios = require('axios');
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const { email, sub: googleId } = response.data;

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user since they don't exist
      user = await User.create({ email, googleId });
      await logAudit('REGISTER', email, 'success', req.ip, 'User registered via Google');
    } else if (!user.googleId) {
      // Link Google ID if they previously registered with password
      user.googleId = googleId;
      await user.save();
    }

    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit('LOGIN', email, 'success', req.ip, 'User logged in via Google');

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateAccessToken(user._id)
    });
  } catch (error) {
    await logAudit('LOGIN_ATTEMPT', 'unknown', 'failure', req.ip, 'Google Auth Failed');
    console.error("Google Auth Error:", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  
  const refreshToken = cookies.jwt;
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "fallback_secret");
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Check if refresh token is in DB
    const tokenIndex = user.refreshTokens.indexOf(refreshToken);
    if (tokenIndex === -1) {
      // Token reuse detected (or logged out)! Invalidate all tokens for security.
      user.refreshTokens = [];
      await user.save();
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    // We disabled aggressive token rotation on every page refresh to prevent 
    // network race conditions from falsely triggering the "Token reuse" trap.
    // The existing refresh token remains valid until it expires.

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: generateAccessToken(user._id)
    });
  } catch (err) {
    res.status(403).json({ message: "Forbidden" });
  }
};

exports.logoutUser = async (req, res) => {
  const cookies = req.cookies;
  if (cookies?.jwt) {
    const refreshToken = cookies.jwt;
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "fallback_secret");
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    } catch (e) {
      // Ignore verification errors on logout
    }
  }

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};

exports.getApiKeyDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("apiKey apiKeyCreatedAt apiKeyLastUsed apiKeyRequestCount apiKeyRateLimit");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      apiKey: user.apiKey || null,
      createdAt: user.apiKeyCreatedAt || null,
      lastUsed: user.apiKeyLastUsed || null,
      requestCount: user.apiKeyRequestCount || 0,
      rateLimit: user.apiKeyRateLimit || 1000
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.generateApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newApiKey = "sk_" + require("crypto").randomBytes(16).toString("hex");
    user.apiKey = newApiKey;
    user.apiKeyCreatedAt = new Date();
    user.apiKeyRequestCount = 0;
    await user.save();

    await logAudit('GENERATE_API_KEY', user.email, 'success', req.ip, 'Generated new API key');

    res.json({ 
      apiKey: newApiKey,
      createdAt: user.apiKeyCreatedAt,
      requestCount: 0,
      rateLimit: user.apiKeyRateLimit || 1000
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.apiKey = undefined;
    user.apiKeyCreatedAt = undefined;
    user.apiKeyLastUsed = undefined;
    user.apiKeyRequestCount = 0;
    await user.save();

    await logAudit('REVOKE_API_KEY', user.email, 'success', req.ip, 'Revoked API key');

    res.json({ message: "API key revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
