import express from 'express';
import Recording from '../models/recording';
import User from '../models/user';
import Activity from '../models/activity';
import moment from 'moment';
import mongoose from 'mongoose';
const router = express.Router();

module.exports = (passport) => {
  // GET /user
  router.get('/user', isLoggedIn, (req, res, next) => {
    let newRecordings, ongoingRecordings, finishedRecordings
    Recording.find().limit(10) //should limit to newest 10 sessions
      .then((recordings) => {
        User.findOne({_id: req.user._id}).populate({path: 'records._recording'})
          .then((user) => {
            // Find new recordings that have not started by user yet
            let userRecordIds = user.records.map((record) => record._recording._id);
            newRecordings = recordings.filter((recording) => {
              return (userRecordIds.some(id => id.equals(recording._id)) == false);
            });
            // Find recordings that have been started but not finished by user
            finishedRecordings = user.records.filter((record) => {
              return record.isFinished == true;
            });
            // Find recordings that have been finished by user
            ongoingRecordings = user.records.filter((record) => {
              return record.isFinished == false;
            });

            // Render page with necessary information
            res.render('user/user', {
                newRecordings: newRecordings,
                ongoingRecordings: ongoingRecordings,
                finishedRecordings: finishedRecordings,
                user: req.user,
                moment: moment,
                messageError: req.flash('messageError'),
                messageSuccess: req.flash('messageSuccess')
            });
          })
          .catch(err => {
            console.log(err);
            next();
          });
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

  // GET /user/session/:recording/finish
  router.get('/user/session/:recording/finish', isLoggedIn, (req, res, next) => {
    User.findOne({_id : req.user._id})
      .then((user) => {
        let isExisted = false;
        for (let i in user.records) {
          if (user.records[i]._recording == req.params.recording) {
            isExisted = true;
            break;
          }
        }

        if (isExisted) {
          User.update({'records._recording': req.params.recording},
            {'$set': {'records.$.isFinished': true}},
            (err, result) => {
              if (err) {
                console.error(err);
                res.redirect('/user');
              } else {
                let newActivity = new Activity();
                newActivity._user = user._id;
                newActivity._recording = req.params.recording;
                newActivity.save((err) => {
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
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

  // GET /user/session/:recording/:index
  router.get('/user/session/:recording/:index', isLoggedIn, (req, res, next) => {
    Recording.findOne({_id: req.params.recording})
      .then((recording) => {
          User.findOne({_id : req.user._id})
            .then((user) => {
              let record;
              if (req.query.a == 'start') {
                let isExisted = false;
                for (let i in user.records) {
                  if (user.records[i]._recording == req.params.recording) {
                    isExisted = true;
                    break;
                  }
                }

                if (!isExisted) {
                  record = {_recording: recording._id, path: 'uploads/' + req.user.username + '/' + recording._id, isFinished: false, lastVisited: Date.now()};
                  user.records.push(record);
                  user.save((err) => {
                    if (err) {
                      console.error(err);
                      next();
                    }
                  });
                }
              } else if (req.query.a == 'continue') {
                User.update({'records._recording': recording._id},
                  {'$set': {'records.$.lastVisited': Date.now()}},
                  (err, result) => {
                    if (err) {
                      console.error(err);
                      next();
                    }
                });
              }
            })
            .then(() => {
              res.render('session/record_session', {
                  username: req.user.username,
                  recording: recording,
                  reqIndex: req.params.index,
                  moment: moment,
              });
            })
            .catch(err => {
              console.log(err);
              next();
            });
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });

  // GET /user/profile
  router.get('/user/profile', isLoggedIn, (req, res, next) => {
    res.render('user/profile', {
      user: req.user,
      moment: moment,
      successMessage: req.flash('successMessage'),
      usernameError: req.flash('usernameError'),
      passwordError: req.flash('passwordError')
    });
  });

  // PUT /user/profile/update_account
  router.put('/user/profile/update_account', isLoggedIn, (req, res, next) => {
    if (req.body.password.length !== 0) {
      if (validatePassword(req.body.password, req.user.username) && req.body.password === req.body.re_password) {
        User.findOneAndUpdate({_id : req.user._id},
          {'$set': {
            password: User.generateHash(req.body.password)
          }},
          (err, result) => {
            if (err) {
              console.error(err);
              next();
            } else {
              req.flash('successMessage', 'Successfully updated your and password.')
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
      req.flash('passwordError', 'The password should: <ul><li>contain between 6 - 16 characters</li><li>contain at least 1 alphabet character and 1 number</li><li>should not be the same as user name</li></ul>')
      res.redirect('/user/profile');
    }
  });

  // PUT /user/profile/update_profile
  router.put('/user/profile/update_profile', isLoggedIn, (req, res, next) => {
    User.findOneAndUpdate({_id : req.user._id},
      {'$set': {
        information: {
          fullname: req.body.fullname,
          gender: req.body.gender,
          date_of_birth: req.body.date_of_birth,
          place_of_birth: req.body.place_of_birth,
          first_language: req.body.first_language,
          medical_condition: req.body.medical_condition.replace(/\n?\r?\r\n/g, '<br />' )
        }
      }},
      (err, result) => {
        if (err) {
          console.error(err);
          next();
        } else {
          req.flash('successMessage', 'Successfully updated your profile information.')
          res.redirect('/user/profile');
        }
    });
  });

  return router;
}


function findExistingSession(records, id) {
  let filter = records.filter((record) => record._recording == id);
  return filter;
}

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/signin');
}

function validatePassword(password, username) {
    // Minimum 6 characters, maximum 16 characters with at least 1 Alphabet and 1 Number
    let isValidated = false;
    let regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
    if((password.toLowerCase() !== username.toLowerCase()) && (regex.test(password))) isValidated = true;
    // let isValidated = true;
    return isValidated;
}

function validateUsername(username) {
    // Minimum 6 characters, maximum 16
    let isValidated = false;
    let regex = /^[A-Za-z\d]{6,16}$/;
    if(regex.test(username)) isValidated = true;
    // let isValidated = true;
    return isValidated;
}
