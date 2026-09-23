const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validatePassword } = require('../utils/passwordValidation');
const { signAccessToken, generateRefreshToken, hashToken, generateVerificationCode } = require('../utils/tokens');
const { sendVerificationEmail, sendResetEmail } = require('../utils/email');
const { loginLimiter, verifyLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  program: user.program,
  semester: user.semester,
  section: user.section,
  notificationEnabled: user.notificationEnabled,
  notificationMinutesBefore: user.notificationMinutesBefore,
  isVerified: user.isVerified,
});

const issueTokens = async (res, user) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  user.refreshTokens.push(hashToken(refreshToken));
  await user.save();
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, program, semester, section } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });
    if (!confirmPassword) return res.status(400).json({ message: 'Please confirm your password' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ message: passwordCheck.message });

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const code = generateVerificationCode();
    const user = await User.create({
      name, email: normalizedEmail, password, program, semester, section,
      verificationTokenHash: hashToken(code),
      verificationTokenExpires: Date.now() + 60 * 60 * 1000
    });

    await sendVerificationEmail(user.email, code);
    res.status(201).json({ message: 'Verification code sent to your email', email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-email', verifyLimiter, async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      verificationTokenHash: hashToken(code),
      verificationTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Code is invalid or expired' });

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resend-verification', verifyLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'No account found with this email' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const code = generateVerificationCode();
    user.verificationTokenHash = hashToken(code);
    user.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(user.email, code);
    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'No account found with this email. Please register first.' });
    if (!(await user.comparePassword(password))) return res.status(400).json({ message: 'Incorrect password' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email before logging in' });

    const accessToken = await issueTokens(res, user);
    res.json({ token: accessToken, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const tokenHash = hashToken(refreshToken);
    const user = await User.findOne({ refreshTokens: tokenHash });
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' });

    user.refreshTokens = user.refreshTokens.filter(t => t !== tokenHash);
    const accessToken = await issueTokens(res, user);
    res.json({ token: accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await User.updateOne({ refreshTokens: tokenHash }, { $pull: { refreshTokens: tokenHash } });
    }
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', loginLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) return res.json({ message: 'If that email exists, a reset code has been sent' });

    const code = generateVerificationCode();
    user.resetTokenHash = hashToken(code);
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    await sendResetEmail(user.email, code);
    res.json({ message: 'If that email exists, a reset code has been sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', verifyLimiter, async (req, res) => {
  try {
    const { email, code, password, confirmPassword } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });
    if (!password || password !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match' });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) return res.status(400).json({ message: passwordCheck.message });

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetTokenHash: hashToken(code),
      resetTokenExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Code is invalid or expired' });

    user.password = password;
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    user.refreshTokens = [];
    await user.save();
    res.json({ message: 'Password reset. Please log in.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) return res.status(400).json({ message: passwordCheck.message });

    const user = await User.findById(req.user.id);
    if (!(await user.comparePassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();
    res.json({ message: 'Password changed. Please log in again.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { name, program, semester, section, notificationEnabled, notificationMinutesBefore } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, program, semester, section, notificationEnabled, notificationMinutesBefore },
      { new: true }
    ).select('-password');
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;