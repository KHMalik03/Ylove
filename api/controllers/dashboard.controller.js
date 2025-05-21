const { pool } = require('../database');
const { getCache, setCache } = require('../utils/cache');

// Get app statistics for admin dashboard
exports.getAppStats = async () => {
  try {
    const cacheKey = 'admin_dashboard_stats';
    let stats = getCache(cacheKey);
    
    if (!stats) {
      // Total users
      const [userCount] = await pool.query('SELECT COUNT(*) as count FROM user');
      
      // Users registered in last 24 hours
      const [newUsers] = await pool.query(
        `SELECT COUNT(*) as count FROM user 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)`
      );
      
      // Active users in last 24 hours
      const [activeUsers] = await pool.query(
        `SELECT COUNT(*) as count FROM user 
         WHERE last_active > DATE_SUB(NOW(), INTERVAL 1 DAY)`
      );
      
      // Total matches
      const [matchCount] = await pool.query('SELECT COUNT(*) as count FROM `match`');
      
      // Matches created in last 24 hours
      const [newMatches] = await pool.query(
        `SELECT COUNT(*) as count FROM \`match\` 
         WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)`
      );
      
      // Total messages
      const [messageCount] = await pool.query('SELECT COUNT(*) as count FROM message');
      
      // Messages sent in last 24 hours
      const [newMessages] = await pool.query(
        `SELECT COUNT(*) as count FROM message 
         WHERE timestamp > DATE_SUB(NOW(), INTERVAL 1 DAY)`
      );
      
      // Gender distribution
      const [genderDistribution] = await pool.query(
        `SELECT gender, COUNT(*) as count 
         FROM profile 
         GROUP BY gender`
      );
      
      // University distribution (top 10)
      const [universityDistribution] = await pool.query(
        `SELECT university, COUNT(*) as count 
         FROM profile 
         WHERE university IS NOT NULL AND university != ''
         GROUP BY university 
         ORDER BY count DESC 
         LIMIT 10`
      );
      
      stats = {
        users: {
          total: userCount[0].count,
          new_24h: newUsers[0].count,
          active_24h: activeUsers[0].count
        },
        matches: {
          total: matchCount[0].count,
          new_24h: newMatches[0].count
        },
        messages: {
          total: messageCount[0].count,
          new_24h: newMessages[0].count
        },
        demographics: {
          gender: genderDistribution,
          universities: universityDistribution
        },
        updated_at: new Date().toISOString()
      };
      
      // Cache for 1 hour
      setCache(cacheKey, stats, 'long');
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting app stats:', error);
    throw error;
  }
};

// Get user report statistics
exports.getUserReportStats = async () => {
  try {
    const cacheKey = 'admin_report_stats';
    let reportStats = getCache(cacheKey);
    
    if (!reportStats) {
      // Get pending reports count
      const [pendingReports] = await pool.query(
        `SELECT COUNT(*) as count FROM report 
         WHERE status = FALSE`
      );
      
      // Get report reasons distribution
      const [reasonDistribution] = await pool.query(
        `SELECT reason, COUNT(*) as count 
         FROM report 
         GROUP BY reason 
         ORDER BY count DESC`
      );
      
      // Get most reported users (top 10)
      const [mostReportedUsers] = await pool.query(
        `SELECT r.reported_id, COUNT(*) as report_count, p.name
         FROM report r
         LEFT JOIN profile p ON r.reported_id = p.user_id
         GROUP BY r.reported_id
         ORDER BY report_count DESC
         LIMIT 10`
      );
      
      reportStats = {
        pending_count: pendingReports[0].count,
        reason_distribution: reasonDistribution,
        most_reported_users: mostReportedUsers,
        updated_at: new Date().toISOString()
      };
      
      // Cache for 1 hour
      setCache(cacheKey, reportStats, 'long');
    }
    
    return reportStats;
  } catch (error) {
    console.error('Error getting report stats:', error);
    throw error;
  }
};