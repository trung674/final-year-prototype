'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _recording = require('../models/recording');

var _recording2 = _interopRequireDefault(_recording);

var _activity = require('../models/activity');

var _activity2 = _interopRequireDefault(_activity);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

var transporter = _nodemailer2.default.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  }
});

module.exports = function (passport) {
  router.get('/admin', isLoggedInAsAdmin, function (req, res, next) {
    _activity2.default.find().limit(10).sort('-createdAt').populate({ path: '_user _recording' }).then(function (activities) {
      res.render('admin/admin', {
        activities: activities,
        admin: req.user,
        moment: _moment2.default
      });
    }).catch(function (err) {
      console.error(err);
      next();
    });
  });

  router.get('/admin/create_admin', isLoggedInAsAdmin, function (req, res, next) {
    res.render('admin/admin', {
      admin: req.user // get the user out of session and pass to template
    });
  });

  router.post('/admin/create_admin', isLoggedInAsAdmin, passport.authenticate('admin_signup', {
    successRedirect: '/admin',
    failureRedirect: '/create_admin',
    failureFlash: true
  }));

  router.get('/admin/session', isLoggedInAsAdmin, function (req, res, next) {
    _recording2.default.find({}, function (err, recordings) {
      if (err) console.log(err);
      res.render('admin/session', {
        title: 'Session management',
        recordings: recordings,
        moment: _moment2.default, message: req.flash('message')
      });
    });
  });

  router.get('/admin/create_session', isLoggedInAsAdmin, function (req, res, next) {
    res.render('admin/create_session', {
      title: 'Create new session',
      message: req.flash('message')
    });
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

  router.get('/admin/edit_session', isLoggedInAsAdmin, function (req, res, next) {
    if (req.query.query) {
      var option = req.query.option;
      var query = req.query.query;
      if (option === 'title') {
        _recording2.default.find({ title: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'description') {
        _recording2.default.find({ description: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'type') {
        _recording2.default.find({ type: { $regex: '' + query, $options: 'i' } }, function (err, recordings) {
          res.render('admin/edit_session', {
            title: 'Edit session',
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
            title: 'Edit session',
            recordings: recordings,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else {
        res.render('admin/edit_session', { title: 'Edit session' });
      }
    } else {
      res.render('admin/edit_session', { title: 'Edit session', message: req.flash('message') });
    }
  });

  router.get('/admin/edit_session/:id', isLoggedInAsAdmin, function (req, res, next) {
    _recording2.default.findOne({ _id: req.params.id }).then(function (recording) {
      res.render('admin/edit_session', {
        title: 'Edit session',
        recording: recording,
        moment: _moment2.default,
        message: req.flash('message')
      });
    }).catch(function (err) {
      console.error(err);
      next();
    });
  });

  router.put('/admin/edit_session/:id', isLoggedInAsAdmin, function (req, res, next) {
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

  router.get('/admin/user_management', isLoggedInAsAdmin, function (req, res, next) {
    var title = 'User Management';
    if (req.query.query) {
      var option = req.query.option;
      var query = req.query.query;
      if (option === 'username') {
        _user2.default.find({ username: { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'fullname') {
        _user2.default.find({ 'information.fullname': { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'email') {
        _user2.default.find({ email: { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'language') {
        _user2.default.find({ 'information.first_language': { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'place_of_birth') {
        _user2.default.find({ 'information.place_of_birth': { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'gender') {
        _user2.default.find({ 'information.gender': query }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'medical') {
        _user2.default.find({ 'information.medical_condition': { $regex: '' + query, $options: 'i' } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else if (option === 'date_of_birth') {
        var start = (0, _moment2.default)(query).startOf('day');
        var end = (0, _moment2.default)(query).endOf('day');
        _user2.default.find({ 'information.date_of_birth': { $gte: start, $lt: end } }, function (err, users) {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: _moment2.default,
            message: req.flash('message')
          });
        });
      } else {
        res.render('admin/user_management', { title: title });
      }
    } else {
      res.render('admin/user_management', { title: title, message: req.flash('message') });
    }
  });

  router.get('/admin/user_management/:id', isLoggedInAsAdmin, function (req, res, next) {
    _user2.default.findOne({ _id: req.params.id }).then(function (user) {
      res.render('admin/user_management', {
        title: 'User management',
        user: user,
        moment: _moment2.default,
        message: req.flash('message')
      });
    }).catch(function (err) {
      console.error(err);
      next();
    });
  });

  router.post('/admin/user_management/:id/send_email', isLoggedInAsAdmin, function (req, res, next) {
    var subject = req.body.subject;
    var message = req.body.message.replace(/\n?\r?\r\n/g, '<br />');
    var mailOptions = {
      from: '"Web Recorder Team - University of Sheffield" <' + process.env.GMAIL_USERNAME + '>',
      to: req.body.email,
      subject: subject,
      text: '' + message,
      html: '' + message
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        return console.log(error);
        res.send('Something went wrong. Please try again !');
      } else {
        res.send('Successfully send email to this user');
      }
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
    if (contentArray[i].length === 0) continue;
    var newValue = contentArray[i].trim();
    contentArray[i] = newValue;
  }
  return contentArray;
}