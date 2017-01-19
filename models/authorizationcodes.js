const mongoose = require('mongoose');

const AuthorizationCode = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('AuthorizationCode', AuthorizationCode);
