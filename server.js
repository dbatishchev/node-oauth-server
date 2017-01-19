import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import errorhandler from 'errorhandler';
import path from 'path';
import oauth2 from './auth/oauth2';
import config from './config';
import site from './routes/site';
import token from './routes/token';
import user from './routes/user';
import AccessToken from './models/accesstokens';
import db from './db/mongoose';

// Express configuration
const app = express();
app.set('view engine', 'ejs');
app.use(cookieParser());

// Session Configuration
app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.session.secret,
    key: 'authorization.sid',
    cookie: {maxAge: config.session.maxAge},
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

if (app.get('env') === 'development') {
    app.use(errorhandler());
}

// Passport configuration
require('./auth/auth');

app.get('/login', site.loginForm);
app.post('/login', site.login);
app.get('/logout', site.logout);

app.get('/dialog/authorize', oauth2.authorization);
app.post('/dialog/authorize/decision', oauth2.decision);
app.post('/oauth/token', oauth2.token);

app.get('/api/userinfo', user.info);

// Mimicking google's token info endpoint from
// https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
app.get('/api/tokeninfo', token.info);

// Mimicking google's token revoke endpoint from
// https://developers.google.com/identity/protocols/OAuth2WebServer
app.get('/api/revoke', token.revoke);

// static resources for stylesheets, images, javascript files
app.use(express.static(path.join(__dirname, 'public')));

// clean up expired tokens
setInterval(() => {
    AccessToken.removeExpired()
        .catch(err => console.error('Error trying to remove expired tokens:', err.stack));
}, config.db.timeToCheckExpiredTokens * 1000);

app.listen(3000, '0.0.0.0', (err) => {
    if (err) {
        console.log(err);
    }
    console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', 3000, 3000);
});