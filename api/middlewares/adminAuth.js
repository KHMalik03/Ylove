// api/middlewares/adminAuth.js
const { protect } = require('./auth');

// Admin authentication middleware
const adminAuth = [
  protect, // First, ensure the user is authenticated
  async (req, res, next) => {
    try {
      // Check if user has admin role (add admin column to user table)
      const [adminCheck] = await pool.query(
        'SELECT is_admin FROM user WHERE user_id = ?',
        [req.user.user_id]
      );
      
      if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }
];

module.exports = adminAuth;