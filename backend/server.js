const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://classpulse-red.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

function ensureDbName(uri) {
  if (!uri) return '';
  const cleanUri = uri.replace(/^["']|["']$/g, '').trim();
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(cleanUri)) return cleanUri;
  const qIndex = cleanUri.indexOf('?');
  if (qIndex === -1) {
    return cleanUri.endsWith('/') ? `${cleanUri}classpulse` : `${cleanUri}/classpulse`;
  }
  const base = cleanUri.slice(0, qIndex);
  const query = cleanUri.slice(qIndex);
  const withDb = base.endsWith('/') ? `${base}classpulse` : `${base}/classpulse`;
  return withDb + query;
}

let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings');
  }
  const dbUri = ensureDbName(rawUri);
  await mongoose.connect(dbUri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 10000
  });
  isConnected = true;
  console.log('MongoDB connected to:', mongoose.connection.db?.databaseName);
}

// Connect to DB BEFORE handling any requests (vital for serverless functions)
app.use(async (req, res, next) => {
  // Allow health check to pass without waiting for DB if wanted, or connect
  if (req.path === '/' || req.path === '/api/health') return next();
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({ message: `Database connection error: ${err.message}` });
  }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notes', require('./routes/notes'));

app.get('/', (req, res) => res.json({ name: 'ClassPulse API', status: 'online', health: '/api/health' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server running' }));

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;