const mongoose = require('mongoose');

const AccessToken = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    clientId: {
        type: String,
        required: true
    },
    clientScope: {
        type: String,
        required: false
    },
    token: {
        type: String,
        unique: true,
        required: true
    },
    expiration: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AccessToken', AccessToken);
