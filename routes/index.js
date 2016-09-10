var express = require('express');
var router = express.Router();


module.exports = function(passport){
  router.get('/', function (req, res) {
    res.render('index', { message: req.flash('loginMessage')});
  });

  router.get('/signin', function (req, res) {
    res.render('index', { message: req.flash('loginMessage')});
  });
  
 router.post('/signin', passport.authenticate('login', {
    successRedirect : '/home',
    failureRedirect: '/',
    failureFlash : true
  }));
  
  router.get('/signup', function(req, res){
    res.render('signup', { message: req.flash('signupMessage')});
  });
  
  router.post('/signup', passport.authenticate('signup', {
    successRedirect : '/login',
    failureRedirect: '/',
    failureFlash : true
  }));

  router.get('/home', isLoggedIn, function(req, res) {
		res.render('home', {
			user : req.user // get the user out of session and pass to template
		});
	});

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
	res.redirect('/');
}