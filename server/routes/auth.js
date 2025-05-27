// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { password1, password2 } = req.body;

  // Passwörter aus Umgebungsvariablen holen
  const validPassword1 = process.env.ADMIN_PASSWORD1;
  const validPassword2 = process.env.ADMIN_PASSWORD2;

  if (password1 === validPassword1 && password2 === validPassword2) {
    // Erfolgreicher Login - Token generieren
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'prometheus-default-secret',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token
    });
  }

  // Falsche Passwörter
  return res.status(401).json({
    success: false,
    message: 'Invalid password combination'
  });
});

module.exports = router;