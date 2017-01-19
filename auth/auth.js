import passport from 'passport';
import LocalStrategy from 'passport-local';
import BearerStrategy from 'passport-http-bearer';
import validate from './../validate';
import User from './../models/users';
import AccessToken from './../models/accesstokens';

passport.use(new LocalStrategy((username, password, done) => {
    User.findByUsername(username)
        .then(user => validate.user(user, password))
        .then(user => done(null, user))
        .catch((e) => done(null, false));
}));

passport.use(new BearerStrategy((accessToken, done) => {
    // todo
    AccessToken.findById(accessToken)
        .then(token => validate.token(token, accessToken))
        .then(token => done(null, token, {scope: '*'}))
        .catch(() => done(null, false));
}));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((id, done) => {
    User.findByUsername(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});