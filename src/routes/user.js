var express = require('express');
var router = express.Router();


module.exports = function(passport){
  router.get('/user', isLoggedIn, function(req, res) {
  	res.render('user', {
  		user : req.user // get the user out of session and pass to template
  	});
    // res.io.emit('user', {status: 'Connect Successfully'});
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
