const mongoose = require('mongoose');

const Client = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    clientId: {
        type: String,
        unique: true,
        required: true
    },
    clientSecret: {
        type: String,
        required: true
    }
});

Client.statics.findByClientId = function findByClientId(clientId, cb) {
    return this.findOne({ clientId: clientId });
};

module.exports = mongoose.model('Client', Client);
