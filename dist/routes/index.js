'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router(); // var express = require('express');
// var router = express.Router();

module.exports = function (passport) {
  router.get('/', isLoggedIn, function (req, res) {
    res.redirect('user/');
  });

  router.get('/signin', function (req, res) {
    res.render('user/signin', { message: req.flash('signinMessage') });
  });

  router.post('/signin', passport.authenticate('login', {
    failureRedirect: '/signin',
    failureFlash: true
  }), function (req, res) {
    // If log in as admin then redirect to /admin, else to /user
    if (!req.user.admin) return res.redirect('/user');else return res.redirect('/admin');
  });

  router.get('/signup', function (req, res) {
    res.render('user/signup', { message: req.flash('signupMessage') });
  });

  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/signin',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // =====================================
  // LOGOUT ==============================
  // =====================================
  router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  return router;
};

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect('/signin');
}