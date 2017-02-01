// var express = require('express');
// var router = express.Router();

import express from 'express';
const router = express.Router();

module.exports = function(passport){
  router.get('/', isLoggedIn, (req, res) => {
		res.redirect('/user');
	});

  router.get('/signin', (req, res) => {
    res.render('index', { message: req.flash('signinMessage')});
  });

 router.post('/signin', passport.authenticate('login', {
    successRedirect : '/user',
    failureRedirect: '/signin',
    failureFlash : true
  }));

  router.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('signupMessage')});
  });

  router.post('/signup', passport.authenticate('signup', {
    successRedirect : '/signin',
    failureRedirect: '/signup',
    failureFlash : true
  }));

	// =====================================
	// LOGOUT ==============================
	// =====================================
	router.get('/signout', (req, res) => {
		req.logout();
		res.redirect('/');
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
