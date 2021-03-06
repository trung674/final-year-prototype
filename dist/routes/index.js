'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

module.exports = function (passport) {
  // GET /
  router.get('/', isLoggedIn, function (req, res) {
    if (!req.user.admin) {
      res.redirect('user/');
    } else {
      res.redirect('admin/');
    }
  });

  // GET /signin
  router.get('/signin', function (req, res) {
    res.render('user/signin', { errorMessage: req.flash('signinErrorMessage'), message: req.flash('signinMessage') });
  });

  // POST /signin
  router.post('/signin', passport.authenticate('login', {
    failureRedirect: '/signin',
    failureFlash: true
  }), function (req, res) {
    // If log in as admin then redirect to /admin, else to /user
    if (!req.user.admin) return res.redirect('/user');else return res.redirect('/admin');
  });

  // GET /signup
  router.get('/signup', function (req, res) {
    res.render('user/signup', {
      message: req.flash('signupMessage'),
      passwordMessage: req.flash('passwordError'),
      usernameMessage: req.flash('usernameError'),
      env: process.env.NODE_ENV
    });
  });

  // POST /signup
  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/signin',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // GET /signout
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