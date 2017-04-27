'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _recording = require('../models/recording');

var _recording2 = _interopRequireDefault(_recording);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _activity = require('../models/activity');

var _activity2 = _interopRequireDefault(_activity);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// var express = require('express');
var router = _express2.default.Router();

module.exports = function (passport) {
  router.get('/user', isLoggedIn, function (req, res, next) {
    var newRecordings = void 0,
        ongoingRecordings = void 0,
        finishedRecordings = void 0;
    _recording2.default.find().limit(10) //should limit to newest 10 sessions
    .then(function (recordings) {
      _user2.default.findOne({ _id: req.user._id }).populate({ path: 'records._recording' }).then(function (user) {
        // Find new recordings that have not started by user yet
        var userRecordIds = user.records.map(function (record) {
          return record._recording._id;
        });
        newRecordings = recordings.filter(function (recording) {
          return userRecordIds.some(function (id) {
            return id.equals(recording._id);
          }) == false;
        });
        // Find recordings that have been started but not finished by user
        finishedRecordings = user.records.filter(function (record) {
          return record.isFinished == true;
        });
        // Find recordings that have been finished by user
        ongoingRecordings = user.records.filter(function (record) {
          return record.isFinished == false;
        });

        // Render page with necessary information
        res.render('user/user', {
          newRecordings: newRecordings,
          ongoingRecordings: ongoingRecordings,
          finishedRecordings: finishedRecordings,
          user: req.user,
          moment: _moment2.default,
          messageError: req.flash('messageError'),
          messageSuccess: req.flash('messageSuccess')
        });
      }).catch(function (err) {
        console.log(err);
        next();
      });
    }).catch(function (err) {
      console.log(err);
      next();
    });
  });

  router.get('/user/session/:recording/finish', isLoggedIn, function (req, res, next) {
    _user2.default.findOne({ _id: req.user._id }).then(function (user) {
      var isExisted = false;
      for (var i in user.records) {
        if (user.records[i]._recording == req.params.recording) {
          isExisted = true;
          break;
        }
      }

      if (isExisted) {
        _user2.default.update({ 'records._recording': req.params.recording }, { '$set': { 'records.$.isFinished': true } }, function (err, result) {
          if (err) {
            console.error(err);
            res.redirect('/user');
          } else {
            var newActivity = new _activity2.default();
            newActivity._user = user._id;
            newActivity._recording = req.params.recording;
            newActivity.save(function (err) {
              if (err) {
                console.error(err);
                next();
              } else {
                req.flash('messageSuccess', 'Good job! You have successfully finished a recording session. Let\'s take a break and start another session when you are ready again.');
                res.redirect('/user');
              }
            });
          }
        });
      } else {
        req.flash('messageError', 'You have not started this session yet!');
        res.redirect('/user');
      }
    }).catch(function (err) {
      console.log(err);
      next();
    });
  });

  router.get('/user/session/:recording/:index', isLoggedIn, function (req, res, next) {
    _recording2.default.findOne({ _id: req.params.recording }).then(function (recording) {
      _user2.default.findOne({ _id: req.user._id }).then(function (user) {
        var record = void 0;
        if (req.query.a == 'start') {
          var isExisted = false;
          for (var i in user.records) {
            if (user.records[i]._recording == req.params.recording) {
              isExisted = true;
              break;
            }
          }

          if (!isExisted) {
            record = { _recording: recording._id, path: 'uploads/' + req.user.username + '/' + recording._id, isFinished: false, lastVisited: Date.now() };
            user.records.push(record);
            user.save(function (err) {
              if (err) {
                console.error(err);
                next();
              }
            });
          }
        } else if (req.query.a == 'continue') {
          _user2.default.update({ 'records._recording': recording._id }, { '$set': { 'records.$.lastVisited': Date.now() } }, function (err, result) {
            if (err) {
              console.error(err);
              next();
            }
          });
        }
      }).then(function () {
        res.render('session/record_session', {
          username: req.user.username,
          recording: recording,
          reqIndex: req.params.index,
          moment: _moment2.default
        });
      }).catch(function (err) {
        console.log(err);
        next();
      });
    }).catch(function (err) {
      console.log(err);
      next();
    });
  });

  router.get('/user/profile', isLoggedIn, function (req, res, next) {
    res.render('user/profile', {
      user: req.user,
      moment: _moment2.default,
      successMessage: req.flash('successMessage'),
      usernameError: req.flash('usernameError'),
      passwordError: req.flash('passwordError')
    });
  });

  router.put('/user/profile/update_account', isLoggedIn, function (req, res, next) {
    if (req.body.password.length !== 0) {
      if (validatePassword(req.body.password, req.user.username) && req.body.password === req.body.re_password) {
        _user2.default.findOneAndUpdate({ _id: req.user._id }, { '$set': {
            password: _user2.default.generateHash(req.body.password)
          } }, function (err, result) {
          if (err) {
            console.error(err);
            next();
          } else {
            req.flash('successMessage', 'Successfully updated your and password.');
            res.redirect('/user/profile');
          }
        });
      } else if (!validatePassword(req.body.password, req.user.username)) {
        req.flash('passwordError', 'The password should: <ul><li>contain between 6 - 16 characters</li><li>contain at least 1 alphabet character and 1 number</li><li>should not be the same as user name</li></ul>');
        res.redirect('/user/profile');
      } else {
        req.flash('passwordError', 'Password inputs are not the same.');
        res.redirect('/user/profile');
      }
    } else {
      req.flash('passwordError', 'The password should: <ul><li>contain between 6 - 16 characters</li><li>contain at least 1 alphabet character and 1 number</li><li>should not be the same as user name</li></ul>');
      res.redirect('/user/profile');
    }
  });

  router.put('/user/profile/update_profile', isLoggedIn, function (req, res, next) {
    _user2.default.findOneAndUpdate({ _id: req.user._id }, { '$set': {
        information: {
          fullname: req.body.fullname,
          gender: req.body.gender,
          date_of_birth: req.body.date_of_birth,
          place_of_birth: req.body.place_of_birth,
          first_language: req.body.first_language,
          medical_condition: req.body.medical_condition.replace(/\n?\r?\r\n/g, '<br />')
        }
      } }, function (err, result) {
      if (err) {
        console.error(err);
        next();
      } else {
        req.flash('successMessage', 'Successfully updated your profile information.');
        res.redirect('/user/profile');
      }
    });
  });

  return router;
};

function findExistingSession(records, id) {
  var filter = records.filter(function (record) {
    return record._recording == id;
  });
  return filter;
}

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();
  // if they aren't redirect them to the home page
  res.redirect('/signin');
}

function validatePassword(password, username) {
  // Minimum 6 characters, maximum 16 characters with at least 1 Alphabet and 1 Number
  // let isValidated = false;
  // let regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
  // if((password.toLowerCase() !== username.toLowerCase()) && (regex.test(password))) isValidated = true;
  var isValidated = true;
  return isValidated;
}

function validateUsername(username) {
  // Minimum 6 characters, maximum 16
  // let isValidated = false;
  // let regex = /^[A-Za-z\d]{6,16}$/;
  // if(regex.test(username)) isValidated = true;
  var isValidated = true;
  return isValidated;
}