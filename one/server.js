const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { Pool } = require('pg');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.REACT_APP_FIREBASE_PROJECT_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Neon PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

app.use('/api/auth/', authLimiter);
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Verify Firebase ID token
const verifyFirebaseToken = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Generate JWT token for our app
const generateAppToken = (uid) => {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: '24h' });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Google Sign-In endpoint
app.post('/api/auth/google-signin', [
  body('idToken')
    .notEmpty()
    .withMessage('Firebase ID token is required')
], validateRequest, async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user info from Firebase
    const firebaseUser = await admin.auth().getUser(uid);
    
    // Store/update user in Neon database
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, display_name, photo_url, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (firebase_uid) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         photo_url = EXCLUDED.photo_url,
         email_verified = EXCLUDED.email_verified,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, firebase_uid, email, display_name, photo_url, email_verified, created_at`,
      [
        firebaseUser.uid,
        firebaseUser.email,
        firebaseUser.displayName,
        firebaseUser.photoURL,
        firebaseUser.emailVerified
      ]
    );

    const dbUser = result.rows[0];
    
    // Generate our app's JWT token
    const appToken = generateAppToken(uid);

    res.json({
      message: 'Authentication successful',
      token: appToken,
      user: {
        id: dbUser.id,
        uid: dbUser.firebase_uid,
        email: dbUser.email,
        displayName: dbUser.display_name,
        photoURL: dbUser.photo_url,
        emailVerified: dbUser.email_verified,
        createdAt: dbUser.created_at
      }
    });

  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
});

// Get current user (protected route)
app.get('/api/auth/me', verifyFirebaseToken, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);
    
    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile (protected route)
app.put('/api/auth/profile', [
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
], verifyFirebaseToken, validateRequest, async (req, res) => {
  try {
    const { displayName } = req.body;
    const uid = req.user.uid;

    const updateData = {};
    if (displayName) {
      updateData.displayName = displayName;
    }

    await admin.auth().updateUser(uid, updateData);
    
    const userRecord = await admin.auth().getUser(uid);
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user account (protected route)
app.delete('/api/auth/account', verifyFirebaseToken, async (req, res) => {
  try {
    await admin.auth().deleteUser(req.user.uid);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Firebase Auth initialized successfully');
});
