import express from 'express';
const router = express.Router();

module.exports = (passport) => {
  router.get('/admin', isLoggedInAsAdmin, (req, res) => {
  	res.render('admin/admin', {
  		admin : req.user // get the user out of session and pass to template
  	});
  });

  router.get('/create_admin',isLoggedInAsAdmin, (req, res) => {
  	res.render('admin/admin', {
  		admin : req.user // get the user out of session and pass to template
  	});
  });

  router.post('/create_admin',isLoggedInAsAdmin, passport.authenticate('admin_signup', {
    successRedirect : '/admin',
    failureRedirect: '/create_admin',
    failureFlash : true
  }));

  // router.get('/session', isLoggedInAsAdmin, (req, res) => {
  // 	res.render('admin/session');
  // });
  //
  // router.post('/session', isLoggedInAsAdmin, (req, res) => {
  //   console.log(req.body);
  // });


  return router;
}

function isLoggedInAsAdmin(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated() && req.user.admin)
		return next();

	// if they aren't redirect them to the home page
	res.status(404).send("<h1> 404 </h1> <h3>Unauthorized access</h3>");
}
