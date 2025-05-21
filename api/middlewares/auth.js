// api/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../database');
const { getCache, setCache } = require('../utils/cache');

exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check cache for user
    const cacheKey = `auth_user_${decoded.id}`;
    let user = getCache(cacheKey, 'short');
    
    if (!user) {
      // Get user from database
      const [users] = await pool.query(
        'SELECT * FROM user WHERE user_id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'Not authorized, user not found' });
      }
      
      user = users[0];
      
      // Cache user for 1 minute
      setCache(cacheKey, user, 'short');
    }
    
    // Check if user is active
    if (user.account_status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};