import login from 'connect-ensure-login';
import oauth2orize from 'oauth2orize';
import passport from 'passport';
import config from './../config/index';
import utils from './../utils';
import validate from './../validate';
import Client from './../models/clients';
import RefreshToken from './../models/refreshtokens';
import AccessToken from './../models/accesstokens';

// create OAuth 2.0 server
const server = oauth2orize.createServer();

// Configured expiresIn
const expiresIn = {expires_in: config.token.expiresIn};

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    const token = utils.createToken({sub: user.id, exp: config.token.expiresIn});
    const expiration = config.token.calculateExpirationDate();

    let accessToken = new AccessToken({
        userId: user.id,
        clientId: client.id,
        clientScope: client.scope,
        token: token,
        expiration: expiration
    });

    accessToken.save()
        .then(() => done(null, token, expiresIn))
        .catch(err => done(err));
}));

server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    RefreshToken.findOne({token: refreshToken, clientId: client.clientId})
        .then(foundRefreshToken => validate.refreshToken(foundRefreshToken, refreshToken, client))
        .then(foundRefreshToken => validate.generateToken(foundRefreshToken))
        .then(token => done(null, token, null, expiresIn))
        .catch(() => done(null, false));
}));

/*
 * User authorization endpoint
 *
 * `authorization` middleware accepts a `validate` callback which is
 * responsible for validating the client making the authorization request.  In
 * doing so, is recommended that the `redirectURI` be checked against a
 * registered value, although security requirements may vary accross
 * implementations.  Once validated, the `done` callback must be invoked with
 * a `client` instance, as well as the `redirectURI` to which the user will be
 * redirected after an authorization decision is obtained.
 *
 * This middleware simply initializes a new authorization transaction.  It is
 * the application's responsibility to authenticate the user and render a dialog
 * to obtain their approval (displaying details about the client requesting
 * authorization).  We accomplish that here by routing through `ensureLoggedIn()`
 * first, and rendering the `dialog` view.
 */
exports.authorization = [
    login.ensureLoggedIn(),
    server.authorization((clientID, redirectURI, scope, done) => {
        Client.findByClientId(clientID)
            .then((client) => {
                if (client) {
                    client.scope = scope; // eslint-disable-line no-param-reassign
                }
                // WARNING: For security purposes, it is highly advisable to check that
                //          redirectURI provided by the client matches one registered with
                //          the server.  For simplicity, this example does not.  You have
                //          been warned.
                return done(null, client, redirectURI);
            })
            .catch(err => done(err));
    }), (req, res, next) => {
        // Render the decision dialog if the client isn't a trusted client
        // TODO:  Make a mechanism so that if this isn't a trusted client, the user can record that
        // they have consented but also make a mechanism so that if the user revokes access to any of
        // the clients then they will have to re-consent.
        Client.findByClientId(req.query.client_id)
            .then((client) => {
                if (client != null && client.trustedClient && client.trustedClient === true) {
                    // This is how we short call the decision like the dialog below does
                    server.decision({loadTransaction: false}, (serverReq, callback) => {
                        callback(null, {allow: true});
                    })(req, res, next);
                } else {
                    res.render('dialog', {
                        transactionID: req.oauth2.transactionID,
                        user: req.user,
                        client: req.oauth2.client
                    });
                }
            })
            .catch(() =>
                res.render('dialog', {
                    transactionID: req.oauth2.transactionID,
                    user: req.user,
                    client: req.oauth2.client
                }));
    }];

/**
 * User decision endpoint
 *
 * `decision` middleware processes a user's decision to allow or deny access
 * requested by a client application.  Based on the grant type requested by the
 * client, the above grant middleware configured above will be invoked to send
 * a response.
 */
exports.decision = [
    login.ensureLoggedIn(),
    server.decision(),
];

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], {session: false}),
    server.token(),
    server.errorHandler(),
];

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.clientId));

server.deserializeClient((id, done) => {
    Client.findByClientId(id)
        .then(client => done(null, client))
        .catch(err => done(err));
});