const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user');

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username }).then(function (user) {
        if (!user || !bcrypt.compareSync(password, user.hash)) {
            return done(null, false, { errors: { 'username or password': 'is invalid' } });
        }

        return done(null, user);
    }).catch(done);
}));
