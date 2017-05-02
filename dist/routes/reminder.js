'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _reminder = require('../models/reminder');

var _reminder2 = _interopRequireDefault(_reminder);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

module.exports = function (passport) {
  // GET /user/reminder
  router.get('/user/reminder', isLoggedIn, function (req, res, next) {
    var now = (0, _moment2.default)().format();
    _reminder2.default.find({ date: { $lte: new Date(now) } }).then(function (reminder) {
      console.log(reminder);
      next();
    }).catch(function (err) {
      console.log(err);
    });
  });

  // GET /user/create_reminder
  router.post('/user/create_reminder', isLoggedIn, function (req, res, next) {
    var newReminder = new _reminder2.default();
    if (req.body.message) newReminder.message = req.body.message;
    newReminder.date = req.body.date;
    newReminder._user = req.user._id;
    newReminder._recording = req.query.r;
    newReminder.save(function (err) {
      if (err) {
        console.error(err);
        res.send('Something went wrong. Please try again !');
      } else {
        res.send('Successfully created a reminder for you :)');
      }
    });
  });

  return router;
};

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect('/signin');
}