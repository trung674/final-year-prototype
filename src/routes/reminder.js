import express from 'express';
import Reminder from '../models/reminder';
import User from '../models/user';
import moment from 'moment';
const router = express.Router();

module.exports = (passport) => {
  router.get('/user/reminder', isLoggedIn, (req, res, next) => {
    let now = moment().format();
    Reminder.find({date: {$lte: new Date(now)}})
      .then((reminder) => {
        console.log(reminder);
        next();
      })
      .catch((err) => {
        console.log(err);
      });
  });

  router.post('/user/create_reminder', isLoggedIn, (req, res, next) => {
    let newReminder = new Reminder();
    if (req.body.message) newReminder.message = req.body.message;
    newReminder.date = req.body.date;
    newReminder._user =  req.user._id;
    newReminder._recording = req.query.r;
    newReminder.save((err) => {
        if (err) {
            console.error(err);
            res.send('Something went wrong. Please try again !');
        } else {
            res.send('Successfully created a reminder for you :)');
        }
    });
  });

  return router;
}

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/signin');
}
