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

  router.get('/user/session/:session_id', isLoggedIn, (req, res, next) => {
    Recording.findOne({_id: req.params.session_id})
      .then((recording) => {
        let userRecords = findExistingSession(req.user.records, req.params.session_id);
        let recordingStatus

        if (userRecords.length == 0) {
          recordingStatus = 'start';
        } else if (userRecords[0].isFinished == false) {
          recordingStatus = 'ongoing';
        } else if (userRecords[0].isFinished == true) {
          recordingStatus = 'finished';
        }

        res.render('session/session', {
          recording : recording,
          recordingStatus : recordingStatus,
          moment : moment,
        });
      })
      .catch(err => {
        console.log(err);
        next();
      })
  });

  router.get('/user/session/:session_id/recording', isLoggedIn, (req, res, next) => {
    Recording.findOne({_id: req.params.session_id})
      .then((recording) => {
        User.findOne({_id : req.user._id})
          .then((user) => {
            let userRecords = findExistingSession(req.user.records, req.params.session_id);
            if (userRecords.length == 0) {
              User.update(
                user,
                {$push: {"records": {session_id : recording._id, path: 'uploads/' + req.user.username + '/' + recording._id, isFinished: false, lastVisited: Date.now() }}},
                {safe :true, new: true},
                (err, user) => {
                  console.log(err);
                  next();
                }
              )
            }
          })

        //
        // User.findByIdAndUpdate(
        //   req.user._id,
        //   {$push: {"records": {session_id : recording._id, path: 'uploads/' + req.user.username + '/' + recording._id, status: 'ongoing', lastVisited: Date.now() }}},
        //   {safe :true, new: true},
        //   (err, user) => {
        //     console.log(err);
        //     next();
        //   }
        // );

        res.render('session/record_session', {
            recording : recording,
            moment : moment,
        });
      })
      .catch(err => {
        console.log(err);
        next();
      })
    // Recording.findOne({_id: req.params.session_id})
    //   .then((recording) => {
    //     let filter = req.user.records.filter((record) => {
    //       return record._id == req.params.sessions_id;
    //     });
    //
    //     let recordingStatus
    //     if (filter.length == 0) {
    //       recordingStatus = 'start';
    //     } else if (filter[0].status == 'ongoing') {
    //       recordingStatus = 'ongoing';
    //     } else if (filter[0].status = 'finished') {
    //       recordingStatus = 'finished';
    //     }
    //
    //     console.log(recordingStatus);
    //     res.render('session/session', {
    //         recording : recording,
    //         recordingStatus : recordingStatus,
    //         user : req.user,
    //         moment : moment
    //     });
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     next();
    //   })
  });

  return router;
}


function findExistingSession(records, id) {
  let filter = records.filter((record) => record.session_id == id);
  return filter;
}

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/signin');
}
