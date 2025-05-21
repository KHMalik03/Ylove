const { pool } = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
      process.env.JWT_SECRET,
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM user WHERE user_id = ?',
      [decoded.id]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    const user = users[0];
    
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