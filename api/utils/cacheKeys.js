const userKeys = {
  user: (id) => `user_${id}`,
  auth: (id) => `auth_user_${id}`,
  profile: (id) => `user_profile_${id}`,
  recommendations: (id, limit) => `recommendations_${id}_${limit || 10}`,
  matches: (id, limit, offset) => `mutual_matches_${id}_${limit || 20}_${offset || 0}`,
  photos: (id) => `user_photos_${id}`
};

const profileKeys = {
  profile: (id) => `profile_${id}`,
  byUser: (id) => `profile_user_${id}`
};

const matchKeys = {
  match: (id) => `match_${id}`,
  userMatches: (id) => `user_matches_${id}`
};

const interestKeys = {
  interest: (id) => `interest_${id}`,
  userInterests: (id) => `user_interests_${id}`
};

module.exports = {
  userKeys,
  profileKeys,
  matchKeys,
  interestKeys
};