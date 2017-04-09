'use strict';

var _passportLocal = require('passport-local');

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// expose this function to our app using module.exports

// load up the user model
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
                            if (validateUsername(req.body.username)) {
                                if (validatePassword(password, req.body.username)) {
                                    verifyRecaptcha(req.body["g-recaptcha-response"], function (success) {
                                        if (success) {
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
                                            if (req.body.medical_condition) newUser.information.medical_condition = req.body.medical_condition.replace(/\n?\r?\r\n/g, '<br />');
                                            newUser.admin = false;
                                            newUser.lastLogIn = Date.now();
                                            // save the user
                                            newUser.save(function (err) {
                                                if (err) throw err;
                                                return done(null, newUser, req.flash('signinMessage', 'You have successfully registered for an account.'));
                                            });
                                        } else {
                                            return done(null, false, req.flash('signupMessage', 'You failed the Captcha test. Are you a robot? If not, please try again.'));
                                        }
                                    });
                                } else {
                                    return done(null, false, req.flash('passwordError', 'The password should: <ul><li>contain between 6 - 16 characters</li><li>contain at least 1 alphabet character and 1 number</li><li>should not be the same as user name</li></ul>'));
                                }
                            } else {
                                return done(null, false, req.flash('usernameError', 'The user name should be more than 6 and less than 16 characters long.'));
                            }
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
                return done(null, false, req.flash('signinErrorMessage', 'No user found. Please try again')); // req.flash is the way to set flashdata using connect-flash
            }
            // if the user is found but the password is wrong
            if (!user.validPassword(password, user.password)) return done(null, false, req.flash('signinErrorMessage', 'Wrong password. Please try again')); // create the loginMessage and save it to session as flashdata

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
}; // load all the things we need


function validatePassword(password, username) {
    // Minimum 6 characters, maximum 16 characters with at least 1 Alphabet and 1 Number
    var isValidated = false;
    var regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if (password.toLowerCase() !== username.toLowerCase() && regex.test(password)) isValidated = true;
    return isValidated;
}

function validateUsername(username) {
    // Minimum 6 characters, maximum 16
    var isValidated = false;
    var regex = /^[A-Za-z\d]{6,16}$/;
    if (regex.test(username)) isValidated = true;
    return isValidated;
}

function verifyRecaptcha(key, callback) {
    _https2.default.get("https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA_SECRET_KEY + "&response=" + key, function (res) {
        var data = "";
        res.on('data', function (chunk) {
            data += chunk.toString();
        });
        res.on('end', function () {
            try {
                var parsedData = JSON.parse(data);
                callback(parsedData.success);
            } catch (e) {
                callback(false);
            }
        });
    });
}