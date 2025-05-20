const interestController = require('../controllers/intrest.controller');

class Interest {

    interest_id;
    name;
    category;

    //Interest class constructor
    constructor(interest_id, name, category) {
        this.interest_id = interest_id;
        this.name = name;
        this.category = category;
    }

     // Create a new interest using the controller
     static async create(interestData) {
        return await interestController.createInterest(interestData);
    }

    // Read an interest by ID using the controller
    static async readById(interestId) {
        return await interestController.getInterestById(interestId);
    }

    // Update an interest using the controller
    static async update(interestId, interestData) {
        return await interestController.updateInterest(interestId, interestData);
    }

    // Delete an interest using the controller
    static async delete(interestId) {
        return await interestController.deleteInterest(interestId);
    }


}

module.exports = Interest;