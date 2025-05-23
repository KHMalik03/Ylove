class Message {

    message_id;
    match_id;
    sender_id;
    content;
    timestamp;
    read_status;

    //Message class constructor
    constructor(message_id, match_id, sender_id, content, timestamp, read_status) {
        this.message_id = message_id;
        this.match_id = match_id;
        this.sender_id = sender_id;
        this.content = content;
        this.timestamp = timestamp || new Date();
        this.read_status = read_status || false;
    }

}

module.exports = Message;