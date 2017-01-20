var express = require('express');
var router = express.Router();


module.exports = function(passport){
  router.get('/', isLoggedIn, function(req, res) {
		res.redirect('/user');
	});

  router.get('/signin', function (req, res) {
    res.render('index', { message: req.flash('loginMessage')});
  });
  
 router.post('/signin', passport.authenticate('login', {
    successRedirect : '/user',
    failureRedirect: '/signin',
    failureFlash : true
  }));
  
  router.get('/signup', function(req, res){
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
	router.get('/signout', function(req, res) {
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