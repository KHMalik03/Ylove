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

}

module.exports = Interest;