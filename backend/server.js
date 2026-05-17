const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Allow ALL origins
app.use(cors());
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ai', require('./routes/ai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server running' }));

function ensureDbName(uri) {
  if (!uri) return 'mongodb://localhost:27017/classpulse';
  try {
    const url = new URL(uri);
    if (url.pathname && url.pathname !== '/' && url.pathname.length > 1) return uri;
    url.pathname = '/classpulse';
    return url.toString();
  } catch { return uri; }
}

mongoose.connect(ensureDbName(process.env.MONGODB_URI))
  .then(() => console.log('MongoDB connected to:', mongoose.connection.db.databaseName))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));