'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _recording = require('../models/recording');

var _recording2 = _interopRequireDefault(_recording);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

module.exports = function (passport) {
  router.get('/admin', isLoggedInAsAdmin, function (req, res) {
    res.render('admin/admin', {
      admin: req.user // get the user out of session and pass to template
    });
  });

  router.get('/admin/create_admin', isLoggedInAsAdmin, function (req, res) {
    res.render('admin/admin', {
      admin: req.user // get the user out of session and pass to template
    });
  });

  router.post('/admin/create_admin', isLoggedInAsAdmin, passport.authenticate('admin_signup', {
    successRedirect: '/admin',
    failureRedirect: '/create_admin',
    failureFlash: true
  }));

  router.get('/admin/session', isLoggedInAsAdmin, function (req, res) {
    _recording2.default.find({}, function (err, recordings) {
      if (err) console.log(err);
      res.render('admin/session', { recordings: recordings, moment: _moment2.default, message: req.flash('message') });
    });
  });

  router.get('/admin/create_session', isLoggedInAsAdmin, function (req, res) {
    res.render('admin/create_session', { message: req.flash('message') });
  });

  router.post('/admin/create_session', isLoggedInAsAdmin, function (req, res, next) {
    _recording2.default.findOne({ 'title': req.body.title }, function (err, recording) {
      if (err) {
        console.log(err);
        next();
      }
      if (recording) {
        req.flash('message', 'This session title is already existed !');
        res.redirect('/create_session');
      } else {
        var newRecording = new _recording2.default();
        newRecording.title = req.body.title;
        newRecording.description = req.body.description;
        newRecording.type = req.body.type;
        if (req.body.type == "words" || req.body.type == "sentences") {
          newRecording.content = formatContent(req.body.content);
        } else {
          newRecording.content = req.body.content.replace(/\n?\r?\r\n/g, '<br />');
        }

        // save the recording
        newRecording.save(function (err) {
          if (err) throw err;
          req.flash('message', 'Successfully create a new session');
          res.redirect('/admin');
        });
      }
    });
  });

  router.get('/admin/edit_session', isLoggedInAsAdmin, function (req, res) {
    if (req.query.query) {
      var option = req.query.option;
      var query = req.query.query;
      if (option === 'title') {
        _recording2.default.find({ title: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'description') {
        _recording2.default.find({ description: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'type') {
        _recording2.default.find({ type: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'date') {
        var start = (0, _moment2.default)(query).startOf('day');
        var end = (0, _moment2.default)(query).endOf('day');
        _recording2.default.find({ createdAt: { $gte: start, $lt: end } }, function (err, recordings) {
          res.render('admin/edit_session', {
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else {
        res.render('admin/edit_session');
      }
    } else {
      res.render('admin/edit_session', { message: req.flash('message') });
    }
  });

  router.get('/admin/edit_session/:id', isLoggedInAsAdmin, function (req, res) {
    _recording2.default.findOne({ _id: req.params.id }).then(function (recording) {
      res.render('admin/edit_session', {
        recording: recording,
        moment: _moment2.default,
        message: req.flash('message')
      });
    }).catch(function (err) {
      console.error(err);
      next();
    });
  });

  router.put('/admin/edit_session/:id', isLoggedInAsAdmin, function (req, res) {
    _recording2.default.findOne({ _id: req.params.id }).then(function (recording) {
      recording.title = req.body.title;
      recording.description = req.body.description;
      if (recording.type == "words" || rrecording.type == "sentences") {
        recording.content = formatContent(req.body.content);
      } else {
        recording.content = req.body.content.replace(/\n?\r?\r\n/g, '<br />');
      }
      recording.save(function (err) {
        if (err) {
          console.error(err);
          next();
        } else {
          req.flash('message', 'Successfully edit the session information');
          res.redirect('/admin/edit_session/' + req.params.id);
        }
      });
    }).catch(function (err) {
      console.error(err);
      next();
    });
  });

  return router;
};

function isLoggedInAsAdmin(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated() && req.user.admin) return next();

  res.status(403).render('403');
}

function formatContent(content) {
  var contentArray = content.split('\r\n');
  for (var i = 0; i < contentArray.length; i++) {
    var newValue = contentArray[i].trim();
    contentArray[i] = newValue;
  }
  return contentArray;
}