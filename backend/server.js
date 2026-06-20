const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/classes', require('./routes/classes'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/notes', require('./routes/notes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Server running' }));

function ensureDbName(uri) {
  if (!uri) return 'mongodb://localhost:27017/classpulse';
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri)) return uri;
  const qIndex = uri.indexOf('?');
  if (qIndex === -1) {
    return uri.endsWith('/') ? `${uri}classpulse` : `${uri}/classpulse`;
  }
  const base = uri.slice(0, qIndex);
  const query = uri.slice(qIndex);
  const withDb = base.endsWith('/') ? `${base}classpulse` : `${base}/classpulse`;
  return withDb + query;
}

mongoose.connect(ensureDbName(process.env.MONGODB_URI))
  .then(() => console.log('MongoDB connected to:', mongoose.connection.db.databaseName))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));