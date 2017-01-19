import mongoose from 'mongoose';

const Client = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    clientId: {
        type: String,
        unique: true,
        required: true,
    },
    clientSecret: {
        type: String,
        required: true,
    },
});

Client.statics.findByClientId = function findByClientId(clientId) {
    return this.findOne({ clientId: clientId });
};

export default mongoose.model('Client', Client);
