// api/controllers/recommendation.controller.js
const { pool } = require('../database');
const { getCache, setCache } = require('../utils/cache');
const { userKeys } = require('../utils/cacheKeys');

// Get potential matches for swiping
exports.getSwipeRecommendations = async (userId, limit = 10) => {
  try {
    const cacheKey = userKeys.recommendations(userId, limit);
    let recommendations = getCache(cacheKey, 'short'); // Short TTL as this data changes frequently
    
    if (!recommendations) {
      // Get the user's profile
      const [userProfiles] = await pool.query(
        `SELECT p.*, u.date_of_birth, 
         TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age
         FROM profile p
         JOIN user u ON p.user_id = u.user_id
         WHERE p.user_id = ?`,
        [userId]
      );
      
      if (userProfiles.length === 0) {
        throw new Error('User profile not found');
      }
      
      const userProfile = userProfiles[0];
      
      // Get user's interests for matching
      const [userInterests] = await pool.query(
        `SELECT interest_id FROM user_interest WHERE user_id = ?`,
        [userId]
      );
      
      const interestIds = userInterests.map(i => i.interest_id);
      
      // Get excluded users (already swiped, blocked, or self)
      const [excludedUsers] = await pool.query(
        `SELECT swiped_id FROM swipe WHERE swiper_id = ?
         UNION
         SELECT blocked_id FROM block WHERE blocker_id = ?
         UNION
         SELECT blocker_id FROM block WHERE blocked_id = ?
         UNION
         SELECT ?`,
        [userId, userId, userId, userId]
      );
      
      const excludedIds = excludedUsers.map(row => row.swiped_id || row.blocked_id || row.blocker_id || row);
      
      // Prepare query
      let query = `
        SELECT 
          p.*,
          u.date_of_birth,
          TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
          (
            SELECT COUNT(*) FROM user_interest ui 
            WHERE ui.user_id = p.user_id AND ui.interest_id IN (?)
          ) AS common_interests,
          (
            SELECT img_URL FROM photo
            WHERE user_id = p.user_id AND is_profile_picture = TRUE
            LIMIT 1
          ) AS profile_picture,
          (
            6371 * acos(
              cos(radians(?)) * cos(radians(p.location_lat)) * 
              cos(radians(p.location_long) - radians(?)) + 
              sin(radians(?)) * sin(radians(p.location_lat))
            )
          ) AS distance_km,
          (p.university = ?) AS same_university
        FROM profile p
        JOIN user u ON p.user_id = u.user_id
        WHERE p.user_id NOT IN (?)
        AND p.visibility = TRUE
        AND p.profile_status = 'active'
        AND u.account_status = 'active'
      `;
      
      const queryParams = [
        interestIds.length ? interestIds : [0],
        userProfile.location_lat,
        userProfile.location_long,
        userProfile.location_lat,
        userProfile.university || '',
        excludedIds.length ? excludedIds : [0]
      ];
      
      // Add gender preference filter if specified
      if (userProfile.gender_preference && userProfile.gender_preference !== 'all') {
        query += ' AND p.gender = ?';
        queryParams.push(userProfile.gender_preference);
      }
      
      // Add age range filter (default: ±5 years from user's age)
      const minAge = userProfile.age - 5 > 18 ? userProfile.age - 5 : 18;
      const maxAge = userProfile.age + 5;
      
      query += ' AND TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) BETWEEN ? AND ?';
      queryParams.push(minAge, maxAge);
      
      // Add distance filter (default: 50km)
      query += ' HAVING distance_km <= ?';
      queryParams.push(50);
      
      // Order by recommendation score (weighted formula)
      query += `
        ORDER BY 
          (common_interests * 10) +  
          (same_university * 15) + 
          (50 - LEAST(distance_km, 50)) +
          (CASE 
             WHEN u.last_login > DATE_SUB(NOW(), INTERVAL 1 DAY) THEN 20
             WHEN u.last_login > DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN 10
             ELSE 0
           END) -
          ABS(? - age) DESC
        LIMIT ?
      `;
      
      queryParams.push(userProfile.age, limit);
      
      // Execute query
      const [results] = await pool.query(query, queryParams);
      
      // Enhance results with formatted data
      recommendations = results.map(profile => ({
        ...profile,
        common_interests_percentage: interestIds.length 
          ? Math.round((profile.common_interests / interestIds.length) * 100) 
          : 0,
        distance_text: profile.distance_km < 1 
          ? 'Less than 1 km' 
          : `${Math.round(profile.distance_km)} km away`
      }));
      
      // Cache recommendations briefly
      setCache(cacheKey, recommendations, 'short');
       for (const profile of recommendations) {
        const [photos] = await pool.query(
          'SELECT * FROM photo WHERE user_id = ? ORDER BY display_order ASC',
          [profile.user_id]
        );
        
        profile.photos = photos;
        
        // Get interests for the profile
        const [interests] = await pool.query(
          `SELECT i.* FROM interest i
           JOIN user_interest ui ON i.interest_id = ui.interest_id
           WHERE ui.user_id = ?`,
          [profile.user_id]
        );
        
        profile.interests = interests;
      }
      
      // Cache for a short time (1 minute)
      setCache(cacheKey, recommendations, 'short');
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error getting swipe recommendations:', error);
    throw error;
  }
};

// Get personalized compatibility score between two users
exports.getCompatibilityScore = async (user1Id, user2Id) => {
  try {
    const cacheKey = `compatibility_${Math.min(user1Id, user2Id)}_${Math.max(user1Id, user2Id)}`;
    let compatibilityData = getCache(cacheKey);
    
    if (!compatibilityData) {
      // Get profiles for both users
      const [profiles] = await pool.query(
        `SELECT p.user_id, p.gender, p.gender_preference, p.university, p.field,
         u.date_of_birth, 
         TIMESTAMPDIFF(YEAR, u.date_of_birth, CURDATE()) AS age,
         p.location_lat, p.location_long
         FROM profile p
         JOIN user u ON p.user_id = u.user_id
         WHERE p.user_id IN (?, ?)`,
        [user1Id, user2Id]
      );
      
      if (profiles.length !== 2) {
        throw new Error('One or both user profiles not found');
      }
      
      const user1Profile = profiles.find(p => p.user_id === user1Id);
      const user2Profile = profiles.find(p => p.user_id === user2Id);
      
      // Get common interests
      const [commonInterestsResult] = await pool.query(
        `SELECT COUNT(*) as common_count
         FROM user_interest ui1
         JOIN user_interest ui2 ON ui1.interest_id = ui2.interest_id
         WHERE ui1.user_id = ? AND ui2.user_id = ?`,
        [user1Id, user2Id]
      );
      
      const commonInterestsCount = commonInterestsResult[0].common_count;
      
      // Get total interests for each user
      const [user1InterestsCount] = await pool.query(
        'SELECT COUNT(*) as count FROM user_interest WHERE user_id = ?',
        [user1Id]
      );
      
      const [user2InterestsCount] = await pool.query(
        'SELECT COUNT(*) as count FROM user_interest WHERE user_id = ?',
        [user2Id]
      );
      
      // Calculate distance between users
      const distanceKm = calculateDistance(
        user1Profile.location_lat, user1Profile.location_long,
        user2Profile.location_lat, user2Profile.location_long
      );
      
      // Calculate age difference
      const ageDifference = Math.abs(user1Profile.age - user2Profile.age);
      
      // Same university and field bonuses
      const sameUniversity = user1Profile.university && 
                             user2Profile.university && 
                             user1Profile.university.toLowerCase() === user2Profile.university.toLowerCase();
      
      const sameField = user1Profile.field && 
                        user2Profile.field && 
                        user1Profile.field.toLowerCase() === user2Profile.field.toLowerCase();
      
      // Calculate compatibility components
      const interestScore = commonInterestsCount > 0 
        ? (commonInterestsCount / Math.max(user1InterestsCount[0].count, user2InterestsCount[0].count)) * 40
        : 0;
      
      const distanceScore = Math.max(0, 30 - (distanceKm / 10));
      const ageScore = Math.max(0, 20 - (ageDifference * 2));
      const universityScore = sameUniversity ? 10 : 0;
      const fieldScore = sameField ? 10 : 0;
      
      // Calculate total compatibility (out of 100)
      const totalScore = Math.min(100, interestScore + distanceScore + ageScore + universityScore + fieldScore);
      
      // Build compatibility report
      compatibilityData = {
        score: Math.round(totalScore),
        details: {
          common_interests: {
            count: commonInterestsCount,
            score: Math.round(interestScore),
            percentage: user1InterestsCount[0].count > 0 
              ? Math.round((commonInterestsCount / user1InterestsCount[0].count) * 100) 
              : 0
          },
          distance: {
            kilometers: Math.round(distanceKm * 10) / 10,
            score: Math.round(distanceScore)
          },
          age_difference: {
            years: ageDifference,
            score: Math.round(ageScore)
          },
          university: {
            same: sameUniversity,
            score: universityScore
          },
          field: {
            same: sameField,
            score: fieldScore
          }
        }
      };
      
      // Cache compatibility score (longer TTL as it changes less frequently)
      setCache(cacheKey, compatibilityData, 'medium');
    }
    
    return compatibilityData;
  } catch (error) {
    console.error('Error calculating compatibility score:', error);
    throw error;
  }
};

// Helper function to calculate distance between coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}