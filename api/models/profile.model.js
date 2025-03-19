const { pool } = require('../database');
const profileController = require('../controllers/profile.controller');

class Profile {

    profile_id;
    user_id;
    name;
    university;
    field;
    bio;
    gender;
    gender_preference;
    profile_status;
    location_lat;
    location_long;
    last_location;
    visibility;

//Profile class constructor
    constructor(profile_id, user_id, name, university, field, bio, gender, gender_preference, profile_status, location_lat, location_long, last_location, visibility) {
        this.profile_id = profile_id;
        this.user_id = user_id;
        this.name = name;
        this.university = university;
        this.field = field;
        this.bio = bio;
        this.gender = gender;
        this.gender_preference = gender_preference;
        this.profile_status = profile_status || 'active';
        this.location_lat = location_lat;
        this.location_long = location_long;
        this.last_location = last_location;
        this.visibility = visibility || true;
    }

     // Create a new profile using the controller
     static async create(profileData) {
        return await profileController.CreateProfile(profileData);
    }

    // Read a profile by ID using the controller
    static async findById(profile_id) {
        return await profileController.ProfileFindById(profile_id);
    }

    // Update a profile using the controller
    static async update(profile_id, profileData) {
        return await profileController.ProfileUpdate(profile_id, profileData);
    }

    // Delete a profile using the controller
    static async delete(profile_id) {
        return await profileController.ProfileDelete(profile_id);
    }
     
    //Update a profile location using the controller
    static async updateLocation(profile_id, locationData) {
        return await profileController.ProfileUpdateLocation(profile_id, locationData);
    }

    //Toggle a profile visibility using the controller
    static async toggleVisibility(profile_id) {
        return await profileController.ProfileToggleVisibility(profile_id);
    }


}

module.exports = Profile;