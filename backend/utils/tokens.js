const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signAccessToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = { signAccessToken, generateRefreshToken, hashToken, generateVerificationCode };