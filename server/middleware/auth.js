// server/routes/auth.js - Fixed für DigitalOcean
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// POST /api/auth/login - Login endpoint
router.post('/login', (req, res) => {
  try {
    const { password1, password2 } = req.body;

    console.log('🔐 Login attempt received');
    console.log('Password1 received:', password1 ? 'Yes' : 'No');
    console.log('Password2 received:', password2 ? 'Yes' : 'No');

    // Passwörter aus Umgebungsvariablen oder Fallback
    const validPassword1 = process.env.ADMIN_PASSWORD1 || 'Kraft';
    const validPassword2 = process.env.ADMIN_PASSWORD2 || 'Vision';

    console.log('Expected Password1:', validPassword1);
    console.log('Expected Password2:', validPassword2);

    // Validierung der Passwörter
    if (!password1 || !password2) {
      console.log('❌ Missing password fields');
      return res.status(400).json({
        success: false,
        message: 'Both passwords are required'
      });
    }

    if (password1 === validPassword1 && password2 === validPassword2) {
      console.log('✅ Login successful');

      // JWT Token generieren
      const token = jwt.sign(
        {
          role: 'admin',
          userId: 'admin',
          loginTime: new Date().toISOString()
        },
        process.env.JWT_SECRET || 'prometheus-default-secret-change-in-production',
        { expiresIn: '24h' }
      );

      // Erfolgreiche Antwort
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: 'admin',
          role: 'admin',
          permissions: ['read', 'write', 'admin']
        }
      });
    } else {
      console.log('❌ Invalid password combination');
      console.log('Received vs Expected:');
      console.log(`Password1: "${password1}" vs "${validPassword1}"`);
      console.log(`Password2: "${password2}" vs "${validPassword2}"`);

      return res.status(401).json({
        success: false,
        message: 'Invalid password combination'
      });
    }
  } catch (error) {
    console.error('🚨 Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/verify - Token verification endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') ||
                  req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Token verifizieren
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'prometheus-default-secret-change-in-production'
    );

    console.log('✅ Token verified for user:', decoded.userId);

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      user: {
        id: decoded.userId,
        role: decoded.role,
        permissions: ['read', 'write', 'admin']
      }
    });

  } catch (error) {
    console.log('❌ Token verification failed:', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// POST /api/auth/logout - Logout endpoint (optional)
router.post('/logout', (req, res) => {
  // In einer JWT-basierten Authentifizierung gibt es keinen serverseitigen Logout
  // Der Client sollte den Token einfach löschen

  console.log('👋 Logout request received');

  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/status - Server status check
router.get('/status', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;