const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');

// Use routes
router.use('/auth', authRoutes);

// Test route
router.get('/', (req, res) => {
  res.json({ 
    message: 'API is working!',
    status: 'connected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;