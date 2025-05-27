// Root index.js - Express-Server für eine React-Anwendung

const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Statische Dateien aus dem Client-Build-Verzeichnis servieren
// Angepasst an Ihre Projektstruktur
app.use(express.static(path.join(__dirname, 'client/build')));

// API-Endpunkte können hier hinzugefügt werden
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Alle anderen Anfragen zur React-App weiterleiten
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Port-Konfiguration - verwendet den von DigitalOcean bereitgestellten Port oder 8080 als Fallback
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});