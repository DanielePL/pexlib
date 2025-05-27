const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Initialisierung der Express-App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// MongoDB-Verbindung
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pexlib')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routen
app.use('/api/auth', require('./routes/auth'));
app.use('/api/avatars', require('./routes/avatars'));
// Weitere Routen hier hinzufügen...

// Statischen Client-Build bereitstellen (für Produktion)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Fehlerbehandlung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server error');
});

// Server starten
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));