// var express = require('express');
import express from 'express';
import Recording from '../models/recording';
import User from '../models/user';
import moment from 'moment';
const router = express.Router();

module.exports = (passport) => {
  router.get('/user', isLoggedIn, (req, res) => {
    Recording.find({}, (err, recordings) => {
      if (err)
        console.log(err);
      res.render('user/user', {
        recordings : recordings,
        user : req.user, // get the user out of session and pass to template
        moment : moment
      });
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
