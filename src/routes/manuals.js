import express from 'express';
const router = express.Router();

module.exports = function(passport){
  router.get('/manuals', isLoggedIn, (req, res, next) => {
    res.render('manuals/manuals');
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
