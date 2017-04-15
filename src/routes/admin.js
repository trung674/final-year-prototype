import express from 'express';
import User from '../models/user';
import Recording from '../models/recording';
import Activity from '../models/activity';
import moment from 'moment';
import nodemailer from 'nodemailer';
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = (passport) => {
  router.get('/admin', isLoggedInAsAdmin, (req, res, next) => {
    Activity.find().limit(10).sort('-createdAt').populate({path: '_user _recording'})
      .then((activities) => {
        res.render('admin/admin', {
          activities: activities,
      		admin : req.user,
          moment: moment
      	});
      })
  	  .catch((err) => {
        console.error(err);
        next();
      });
  });

  router.get('/admin/create_admin',isLoggedInAsAdmin, (req, res, next) => {
  	res.render('admin/admin', {
  		admin : req.user // get the user out of session and pass to template
  	});
  });

  router.post('/admin/create_admin',isLoggedInAsAdmin, passport.authenticate('admin_signup', {
    successRedirect : '/admin',
    failureRedirect: '/create_admin',
    failureFlash : true
  }));

  router.get('/admin/session', isLoggedInAsAdmin, (req, res, next) => {
    Recording.find({}, (err, recordings) => {
        if (err)
          console.log(err);
        res.render('admin/session', {
          title: 'Session management',
          recordings: recordings,
          moment: moment, message: req.flash('message')
        });
    });
  });

  router.get('/admin/create_session', isLoggedInAsAdmin, (req, res, next) => {
  	res.render('admin/create_session', {
      title: 'Create new session',
      message: req.flash('message')
    });
  });

  router.post('/admin/create_session', isLoggedInAsAdmin, (req, res, next) => {
    Recording.findOne({'title': req.body.title}, (err, recording) => {
      if (err) {
        console.log(err);
        next();
      }
      if (recording) {
        req.flash('message', 'This session title is already existed !');
        res.redirect('/create_session');
      } else {
        let newRecording = new Recording();
        newRecording.title = req.body.title;
        newRecording.description = req.body.description;
        newRecording.type = req.body.type;
        if (req.body.type == "words" || req.body.type == "sentences") {
          newRecording.content = formatContent(req.body.content);
        } else {
          newRecording.content = req.body.content.replace(/\n?\r?\r\n/g, '<br />');
        }

        // save the recording
        newRecording.save((err) => {
            if (err)
                throw err;
            req.flash('message', 'Successfully create a new session');
            res.redirect('/admin');
        });
      }
    });
  });

  router.get('/admin/edit_session', isLoggedInAsAdmin, (req, res, next) => {
    if (req.query.query) {
      let option = req.query.option;
      let query = req.query.query;
      if(option === 'title') {
        Recording.find({title: {$regex: `${query}`, $options: 'i'}}, (err, recordings) => {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'description') {
        Recording.find({description: {$regex: `${query}`, $options: 'i'}}, (err, recordings) => {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'type') {
        Recording.find({type: {$regex: `${query}`, $options: 'i'}}, (err, recordings) => {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'date') {
        let start = moment(query).startOf('day');
        let end = moment(query).endOf('day');
        Recording.find({createdAt: {$gte: start, $lt: end}}, (err, recordings) => {
          res.render('admin/edit_session', {
            title: 'Edit session',
            recordings: recordings,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else {
        res.render('admin/edit_session', {title: 'Edit session'});
      }
    } else {
      res.render('admin/edit_session', {title: 'Edit session', message: req.flash('message')});
    }
  });

  router.get('/admin/edit_session/:id', isLoggedInAsAdmin, (req, res, next) => {
    Recording.findOne({_id: req.params.id})
      .then((recording) => {
        res.render('admin/edit_session', {
          title: 'Edit session',
          recording: recording,
          moment: moment,
          message: req.flash('message')
        });
      })
      .catch((err) => {
        console.error(err);
        next()
      });
  });

  router.put('/admin/edit_session/:id', isLoggedInAsAdmin, (req, res, next) => {
    Recording.findOne({_id : req.params.id})
      .then((recording) => {
        recording.title = req.body.title;
        recording.description = req.body.description;
        if (recording.type == "words" || rrecording.type == "sentences") {
          recording.content = formatContent(req.body.content);
        } else {
          recording.content = req.body.content.replace(/\n?\r?\r\n/g, '<br />');
        }
        recording.save((err) => {
            if (err) {
              console.error(err);
              next();
            } else {
              req.flash('message', 'Successfully edit the session information');
              res.redirect(`/admin/edit_session/${req.params.id}`);
            }
        });
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  });

  router.get('/admin/user_management', isLoggedInAsAdmin, (req, res, next) => {
    let title = 'User Management';
    if (req.query.query) {
      let option = req.query.option;
      let query = req.query.query;
      if(option === 'username') {
        User.find({username: {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'fullname') {
        User.find({'information.fullname': {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'email') {
        User.find({email: {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'language') {
        User.find({'information.first_language': {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'place_of_birth') {
        User.find({'information.place_of_birth': {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'gender') {
        User.find({'information.gender': query}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'medical') {
        User.find({'information.medical_condition': {$regex: `${query}`, $options: 'i'}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else if (option === 'date_of_birth') {
        let start = moment(query).startOf('day');
        let end = moment(query).endOf('day');
        User.find({'information.date_of_birth': {$gte: start, $lt: end}}, (err, users) => {
          res.render('admin/user_management', {
            title: title,
            users: users,
            moment: moment,
            message: req.flash('message')
          });
        });
      } else {
        res.render('admin/user_management', {title: title});
      }
    } else {
      res.render('admin/user_management', {title: title, message: req.flash('message')});
    }
  });

  router.get('/admin/user_management/:id', isLoggedInAsAdmin, (req, res, next) => {
    User.findOne({_id: req.params.id})
      .then((user) => {
        res.render('admin/user_management', {
          title: 'User management',
          user: user,
          moment: moment,
          message: req.flash('message')
        });
      })
      .catch((err) => {
        console.error(err);
        next();
      });
  });

  router.post('/admin/user_management/:id/send_email', isLoggedInAsAdmin, (req, res, next) => {
    let subject = req.body.subject;
    let message = req.body.message.replace(/\n?\r?\r\n/g, '<br />');
    let mailOptions = {
      from: `"Web Recorder Team - University of Sheffield" <${process.env.GMAIL_USERNAME}>`,
      to: req.body.email,
      subject: subject,
      text: `${message}`,
      html: `${message}`
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
          res.send('Something went wrong. Please try again !');
        } else {
          res.send('Successfully send email to this user');
        }
    });
  });


  return router;
}

function isLoggedInAsAdmin(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated() && req.user.admin)
		return next();

	res.status(403).render('403');
}

function formatContent(content) {
  let contentArray = content.split('\r\n');
  for (let i = 0; i < contentArray.length; i++) {
    if (contentArray[i].length === 0) continue;
    let newValue = contentArray[i].trim();
    contentArray[i] = newValue;
  }
  return contentArray;
}
