// var express = require('express');
import express from 'express';
import Recording from '../models/recording';
import User from '../models/user';
import moment from 'moment';
const router = express.Router();

module.exports = (passport) => {
  router.get('/user', isLoggedIn, (req, res) => {
    // Recording.find({}, (err, recordings) => {
    //   if (err)
    //     console.log(err);
    //   res.render('user/user', {
    //     recordings : recordings,
    //     user : req.user, // get the user out of session and pass to template
    //     moment : moment
    //   });
    // });
    // Recording.find()
    //   .then((recordings) => {
    //     return User.find({records.status == 'ongoing'})
    //       .then((ongoingRecords) {
    //         return User.find({records.status == 'finished'})
    //           .then((finishedRecords) {
    //             res.render('user/user', {
    //                 newRecordings : recordings,
    //                 ongoingRecordings : ongoingRecords,
    //                 finishedRecordings : finishedRecords,
    //                 user : req.user, // get the user out of session and pass to template
    //                 moment : moment
    //               });
    //           })
    //       })
    //   })

    Recording.find()
      .then((recordings) => {
        res.render('user/user', {
            newRecordings : recordings,
            user : req.user,
            moment : moment
        });
      })
      .catch(err => {
        console.log(err);
      })
  });

  router.get('/user/session/:session_id', isLoggedIn, (req, res) => {
    Recording.findOne({_id: req.params.session_id})
      .then((recording) => {
        res.render('session/session', {
            recording : recording,
            user : req.user,
            moment : moment
        });
      })
      .catch(err => {
        console.log(err);
      })
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
