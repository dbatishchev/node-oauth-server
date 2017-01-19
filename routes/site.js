import passport from 'passport';

/**
 * Render the login.ejs
 * @param   {Object} req - The request
 * @param   {Object} res - The response
 * @returns {undefined}
 */
exports.loginForm = (req, res) => {
    res.render('login');
};

/**
 * Authenticate normal login page using strategy of authenticate
 */
exports.login = [
    passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' }),
];

/**
 * Logout of the system and redirect to root
 * @param   {Object}   req - The request
 * @param   {Object}   res - The response
 * @returns {undefined}
 */
exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};