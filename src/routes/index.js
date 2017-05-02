import express from 'express';
const router = express.Router();

module.exports = function(passport){
  // GET /
  router.get('/', isLoggedIn, (req, res) => {
    if (!req.user.admin) {
		    res.redirect('user/');
    } else {
        res.redirect('admin/');
    }
	});

  // GET /signin
  router.get('/signin', (req, res) => {
    res.render('user/signin', { errorMessage: req.flash('signinErrorMessage'), message: req.flash('signinMessage')});
  });

  // POST /signin
 router.post('/signin',
    passport.authenticate('login', {
      failureRedirect: '/signin',
      failureFlash : true
    }), function(req, res) {
      // If log in as admin then redirect to /admin, else to /user
      if (!req.user.admin)
        return res.redirect('/user');
      else
        return res.redirect('/admin');
  });

  // GET /signup
  router.get('/signup', (req, res) => {
    res.render('user/signup', {
      message: req.flash('signupMessage'),
      passwordMessage: req.flash('passwordError'),
      usernameMessage: req.flash('usernameError'),
      env: process.env.NODE_ENV
     });
  });

  // POST /signup
  router.post('/signup', passport.authenticate('signup', {
    successRedirect : '/signin',
    failureRedirect: '/signup',
    failureFlash : true
  }));

  // GET /signout
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
