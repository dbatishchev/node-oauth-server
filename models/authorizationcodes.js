const mongoose = require('mongoose');

const AuthorizationCode = new mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
});

export default mongoose.model('AuthorizationCode', AuthorizationCode);
