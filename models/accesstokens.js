import mongoose from 'mongoose';

const AccessToken = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    clientId: {
        type: String,
        required: true,
    },
    clientScope: {
        type: String,
        required: false,
    },
    token: {
        type: String,
        unique: true,
        required: true,
    },
    expiration: {
        type: Date,
        default: Date.now,
    },
});

AccessToken.statics.removeExpired = function removeExpired() {
    // todo
};

export default mongoose.model('AccessToken', AccessToken);
