const Joi = require('joi');

// User validation schema
const userSchema = Joi.object({
  phone_number: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
  password_hash: Joi.string().required(),
  date_of_birth: Joi.date().max('now').min('now-100y').required(),
  account_status: Joi.string().valid('active', 'inactive', 'suspended'),
  verification_status: Joi.boolean()
});

// Profile validation schema
const profileSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  name: Joi.string().max(100).required(),
  university: Joi.string().max(100),
  field: Joi.string().max(100),
  bio: Joi.string().max(500),
  gender: Joi.string().valid('male', 'female', 'non-binary', 'other').required(),
  gender_preference: Joi.string().valid('male', 'female', 'all'),
  profile_status: Joi.string().valid('active', 'inactive', 'hidden'),
  location_lat: Joi.number().min(-90).max(90).required(),
  location_long: Joi.number().min(-180).max(180).required(),
  visibility: Joi.boolean().default(true)
});

// Apply validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    next();
  };
};

module.exports = {
  userSchema,
  profileSchema,
  validateRequest
};