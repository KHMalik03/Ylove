const { pool } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getCache, setCache } = require('../utils/cache');

// Login user
exports.login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;
    
    // Find user by phone number
    const [users] = await pool.query(
      'SELECT * FROM user WHERE phone_number = ?',
      [phone_number]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await pool.query(
      'UPDATE user SET last_login = NOW() WHERE user_id = ?',
      [user.user_id]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET || 'ylove_default_secret',
      { expiresIn: '30d' }
    );
    
    res.json({
      token,
      user: {
        user_id: user.user_id,
        phone_number: user.phone_number,
        account_status: user.account_status,
        verification_status: user.verification_status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { phone_number, password, date_of_birth } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM user WHERE phone_number = ?',
      [phone_number]
    );
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Format date for MySQL
    const formattedDOB = new Date(date_of_birth).toISOString().split('T')[0];
    
    // Create user
    const [result] = await pool.query(
      `INSERT INTO user (phone_number, password_hash, date_of_birth, created_at, account_status)
       VALUES (?, ?, ?, NOW(), 'active')`,
      [phone_number, password_hash, formattedDOB]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET || 'ylove_default_secret',
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      token,
      user: {
        user_id: result.insertId,
        phone_number,
        account_status: 'active',
        verification_status: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Get current user data
exports.getMe = async (req, res) => {
  try {
    // User data is already loaded by the protect middleware
    res.json({
      user: {
        user_id: req.user.user_id,
        phone_number: req.user.phone_number,
        account_status: req.user.account_status,
        verification_status: req.user.verification_status,
        last_login: req.user.last_login,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
};

// Authentication middleware
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ylove_default_secret');
    
    // Check if user exists in cache first
    const cacheKey = `auth_user_${decoded.id}`;
    let user = getCache(cacheKey);
    
    if (!user) {
      // Get user from database
      const [users] = await pool.query(
        'SELECT * FROM user WHERE user_id = ?',
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      user = users[0];
      
      // Cache user data for 5 minutes
      setCache(cacheKey, user, 'short');
    }
    
    if (user.account_status !== 'active') {
      return res.status(401).json({ error: 'Account is not active' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Not authorized' });
  }
};