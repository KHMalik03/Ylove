const profileController = require('../controllers/profile.controller.js');

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
        return await profileController.createProfile(profileData);
    }

    // Read a profile by ID using the controller
    static async readById(profileId) {
        return await profileController.getProfileById(profileId);
    }

    // Update a profile using the controller
    static async update(profileId, profileData) {
        return await profileController.updateProfile(profileId, profileData);
    }

    // Delete a profile using the controller
    static async delete(profileId) {
        return await profileController.deleteProfile(profileId);
    }

}

module.exports = Profile;