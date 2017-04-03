'use strict';

var _passportLocal = require('passport-local');

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// expose this function to our app using module.exports

// load all the things we need
// const LocalStrategy   = require('passport-local').Strategy;
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        _user2.default.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('signup', new _passportLocal.Strategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {
            _user2.default.findOne({ 'username': req.body.username }, function (err, user) {
                if (err) return done(err);
                // check to see if theres already a user with that username
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'This name is already taken.'));
                } else {
                    // then check email
                    _user2.default.findOne({ 'email': email }, function (err, user) {
                        // if there are any errors, return the error
                        if (err) return done(err);
                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'This email is already taken.'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = new _user2.default();

                            // set the user's local credentials
                            newUser.email = email;
                            newUser.username = req.body.username;
                            newUser.password = newUser.generateHash(password);
                            if (req.body.fullname) newUser.information.fullname = req.body.fullname;
                            if (req.body.gender) newUser.information.gender = req.body.gender;
                            if (req.body.date_of_birth) newUser.information.date_of_birth = req.body.date_of_birth;
                            if (req.body.place_of_birth) newUser.information.place_of_birth = req.body.place_of_birth;
                            if (req.body.first_language) newUser.information.first_language = req.body.first_language;
                            if (req.body.medical_condition) newUser.information.medical_condition = req.body.medical_condition;
                            newUser.admin = false;
                            newUser.lastLogIn = Date.now();
                            // save the user
                            newUser.save(function (err) {
                                if (err) throw err;
                                return done(null, newUser, req.flash('signinMessage', 'You have successfully registered for an account.'));
                            });
                        }
                    });
                }
            });
        });
    }));

    passport.use('login', new _passportLocal.Strategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, email, password, done) {
        // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        _user2.default.findOne({ 'email': email }, function (err, user) {
            // if there are any errors, return the error before anything else
            if (err) return done(err);

            // if no user is found, return the message
            if (!user) {
                return done(null, false, req.flash('signinMessage', 'No user found. Please try again')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password, user.password)) return done(null, false, req.flash('signinMessage', 'Wrong password. Please try again')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            // update lastLogIn value (for both user and admin)
            user.lastLogIn = Date.now();
            user.save(function (err) {
                if (err) throw err;
                return done(null, user);
            });
        });
    }));

    passport.use('admin_signup', new _passportLocal.Strategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    }, function (req, email, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function () {
            _user2.default.findOne({ 'username': req.body.username }, function (err, user) {
                if (err) return done(err);
                // check to see if theres already a user with that username
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'This name is already taken.'));
                } else {
                    // then check email
                    _user2.default.findOne({ 'email': email }, function (err, user) {
                        // if there are any errors, return the error
                        if (err) return done(err);
                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'This email is already taken.'));
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser = new _user2.default();

                            // set the user's local credentials
                            newUser.email = email;
                            newUser.username = req.body.username;
                            newUser.password = newUser.generateHash(password);
                            newUser.admin = true;
                            newUser.lastLogIn = Date.now();
                            // save the user
                            newUser.save(function (err) {
                                if (err) throw err;
                                return done(null, newUser, req.flash('signinMessage', 'You have successfully registered for an administrator account.'));
                            });
                        }
                    });
                }
            });
        });
    }));
};
// load up the user model
// var User            = require('../models/user');