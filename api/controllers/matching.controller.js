// api/controllers/matching.controller.js
const { pool } = require('../database');
const { getCache, setCache } = require('../utils/cache');

// Get recommended profiles for a user
exports.getRecommendations = async (userId, limit = 10) => {
  try {
    const cacheKey = `recommendations_${userId}_${limit}`;
    let recommendations = getCache(cacheKey, 'short'); // Short TTL for recommendations (1 minute)
    
    if (!recommendations) {
      // Get user profile for preferences
      const [userProfiles] = await pool.query(
        `SELECT p.*, u.date_of_birth 
         FROM profile p
         JOIN user u ON p.user_id = u.user_id
         WHERE p.user_id = ?`,
        [userId]
      );
      
      if (userProfiles.length === 0) {
        throw new Error('User profile not found');
      }
      
      const userProfile = userProfiles[0];
      
      // Get user's interests
      const [userInterests] = await pool.query(
        `SELECT interest_id FROM user_interest WHERE user_id = ?`,
        [userId]
      );
      
      const interestIds = userInterests.map(i => i.interest_id);
      const interestPlaceholders = interestIds.length ? interestIds.map(() => '?').join(',') : '0';
      
      // Get already swiped users
      const [swipedUsers] = await pool.query(
        'SELECT swiped_id FROM swipe WHERE swiper_id = ?',
        [userId]
      );
      
      const swipedIds = swipedUsers.map(s => s.swiped_id);
      
      // Get blocked users
      const [blockedRelations] = await pool.query(
        `SELECT blocked_id FROM block WHERE blocker_id = ?
         UNION
         SELECT blocker_id FROM block WHERE blocked_id = ?`,
        [userId, userId]
      );
      
      const blockedIds = blockedRelations.map(b => b.blocked_id || b.blocker_id);
      
      // Combined excluded IDs
      const excludeIds = [...swipedIds, ...blockedIds, userId];
      
      // Build query parameters
      const queryParams = [
        userId, // For checking same university bonus
      ];
      
      // Add interest IDs if any
      if (interestIds.length > 0) {
        queryParams.push(...interestIds);
      }
      
      // Add location params for distance calculation
      queryParams.push(
        userProfile.location_lat,
        userProfile.location_long,
        userProfile.location_lat
      );
      
      // Add excluded IDs if any
      if (excludeIds.length > 0) {
        queryParams.push(excludeIds);
      }
      
      // Add gender preference if specified
      let genderFilter = '';
      if (userProfile.gender_preference && userProfile.gender_preference !== 'all') {
        genderFilter = 'AND p.gender = ?';
        queryParams.push(userProfile.gender_preference);
      }
      
      // Add limit
      queryParams.push(limit);
      
      // Build recommendation query
      const query = `
        SELECT 
          p.*,
          u.date_of_birth,
          TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
          (SELECT COUNT(*) FROM user_interest ui 
           WHERE ui.user_id = p.user_id 
           AND ui.interest_id IN (${interestPlaceholders})) AS common_interests,
          (p.university = (SELECT university FROM profile WHERE user_id = ?)) AS same_university,
          (SELECT img_URL FROM photo 
           WHERE user_id = p.user_id AND is_profile_picture = TRUE 
           LIMIT 1) AS profile_picture,
          (
            6371 * acos(
              cos(radians(?)) * cos(radians(p.location_lat)) * 
              cos(radians(p.location_long) - radians(?)) + 
              sin(radians(?)) * sin(radians(p.location_lat))
            )
          ) AS distance_km
        FROM profile p
        JOIN user u ON p.user_id = u.user_id
        WHERE p.user_id NOT IN (?)
        AND p.visibility = TRUE
        AND p.profile_status = 'active'
        AND u.account_status = 'active'
        ${genderFilter}
        ORDER BY 
          (common_interests * 10) +  -- Weight interests heavily
          (same_university * 20) +   -- Bonus for same university
          (50 - LEAST(distance_km, 50)) + -- Distance matters (closer is better)
          (CASE 
             WHEN u.last_login > DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 10
             WHEN u.last_login > DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 5
             ELSE 0
           END) DESC  -- Prefer recently active users
        LIMIT ?
      `;
      
      const [results] = await pool.query(query, queryParams);
      
      // Enhanced results with calculated fields
      recommendations = results.map(profile => ({
        ...profile,
        common_interests_percentage: interestIds.length 
          ? Math.round((profile.common_interests / interestIds.length) * 100) 
          : 0,
        distance_text: profile.distance_km < 1 
          ? 'Less than 1 km' 
          : `${Math.round(profile.distance_km)} km away`
      }));
      
      // Cache recommendations for 1 minute
      setCache(cacheKey, recommendations, 'short');
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

// Get mutual matches for a user
exports.getMutualMatches = async (userId, limit = 20, offset = 0) => {
  try {
    const cacheKey = `mutual_matches_${userId}_${limit}_${offset}`;
    let matches = getCache(cacheKey);
    
    if (!matches) {
      const query = `
        SELECT 
          m.*,
          (
            SELECT MAX(timestamp) FROM message 
            WHERE match_id = m.match_id
          ) AS last_message_time,
          (
            SELECT COUNT(*) FROM message 
            WHERE match_id = m.match_id 
            AND sender_id != ? 
            AND read_status = FALSE
          ) AS unread_count,
          IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1) AS other_user_id,
          (
            SELECT name FROM profile
            WHERE user_id = IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1)
          ) AS other_user_name,
          (
            SELECT img_URL FROM photo
            WHERE user_id = IF(m.user_id_1 = ?, m.user_id_2, m.user_id_1)
            AND is_profile_picture = TRUE
            LIMIT 1
          ) AS other_user_photo
        FROM \`match\` m
        WHERE (m.user_id_1 = ? OR m.user_id_2 = ?)
        AND m.is_active = TRUE
        ORDER BY last_message_time DESC, m.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [results] = await pool.query(query, [
        userId, userId, userId, userId, userId, userId, limit, offset
      ]);
      
      matches = results;
      
      // Cache for 5 minutes
      setCache(cacheKey, matches);
    }
    
    return matches;
  } catch (error) {
    console.error('Error getting mutual matches:', error);
    throw error;
  }
};