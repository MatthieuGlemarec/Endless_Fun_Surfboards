module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You do not have permission to access this page!');
        return res.redirect('/');
    }
    next();
};

