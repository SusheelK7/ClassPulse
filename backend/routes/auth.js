const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { validatePassword } = require('../utils/passwordValidation');
const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  program: user.program,
  semester: user.semester,
  section: user.section,
  notificationEnabled: user.notificationEnabled,
  notificationMinutesBefore: user.notificationMinutesBefore,
});

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
    const user = await User.create({ name, email: normalizedEmail, password, program, semester, section });
    const token = signToken(user._id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'No account found with this email. Please register first.' });
    if (!(await user.comparePassword(password))) return res.status(400).json({ message: 'Incorrect password' });
    const token = signToken(user._id);
    res.json({ token, user: formatUser(user) });
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
