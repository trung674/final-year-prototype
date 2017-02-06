import express from 'express';
import Session from '../models/session'
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

  router.get('/session', isLoggedInAsAdmin, (req, res) => {
    let session = Session.find();
  	res.render('admin/session', session);
  });

  router.get('/create_session', isLoggedInAsAdmin, (req, res) => {
  	res.render('admin/create_session', {message: req.flash('message')});
  });

  router.post('/create_session', isLoggedInAsAdmin, (req, res) => {
    Session.findOne({'title': req.body.title}, (err, session) => {
      if (err) {
        console.log(err);
        req.flash('message', 'This session title is already existed !');
        res.redirect('/create_session');
      } else {
        let newSession = new Session();
        newSession.title = req.body.title;
        newSession.description = req.body.username;
        newSession.type = req.body.type;
        newSession.content = formatContent(req.body.content);
        // save the user
        newSession.save((err) => {
            if (err)
                throw err;
            res.redirect('/session');
        });

      }
    });
  });


  return router;
}

function isLoggedInAsAdmin(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated() && req.user.admin)
		return next();

	// if they aren't redirect them to the home page
	res.status(404).send("<h1> 404 </h1> <h3>Unauthorized access</h3>");
}

function formatContent(content) {
  let contentArray = content.split(',');
  for (let i = 0; i < contentArray.length; i++) {
    let newValue = contentArray[i].trim();
    contentArray[i] = newValue;
  }
  return contentArray;
}
