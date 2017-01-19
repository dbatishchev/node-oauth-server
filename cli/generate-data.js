const db = require('../db/mongoose');
const User = require('../models/user');
const Client = require('../models/client');
const AccessToken = require('../models/accessToken');
const RefreshToken = require('../models/refreshToken');

User.remove({}, function (err) {
    var user = new User({
        username: config.get('test'),
        password: config.get('test')
    });

    user.save(function (err, user) {
        if (!err) {
            console.info('New user - %s:%s', user.username, user.password);
        } else {
            return console.error(err);
        }
    });
});

Client.remove({}, function (err) {
    var client = new Client({
        name: 'API V1',
        clientId: 'local',
        clientSecret: 'random'
    });

    client.save(function (err, client) {
        if (!err) {
            console.info('New client - %s:%s', client.clientId, client.clientSecret);
        } else {
            return console.error(err);
        }
    });
});

AccessToken.remove({}, function (err) {
    if (err) {
        return console.error(err);
    }
});

RefreshToken.remove({}, function (err) {
    if (err) {
        return console.error(err);
    }
});

setTimeout(() => {
    db.disconnect();
}, 3000);