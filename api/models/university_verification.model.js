class UniversityVerification {

    verification_id;
    user_id;
    verification_status;
    verified_at;

    //UniversityVerification class constructor
    constructor(verification_id, user_id, verification_status, verified_at) {
        this.verification_id = verification_id;
        this.user_id = user_id;
        this.verification_status = verification_status || false;
        this.verified_at = verified_at;
    }

}

module.exports = UniversityVerification;