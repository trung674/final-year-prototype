import express from 'express';
import Recording from '../models/recording'
import moment from 'moment';
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
    Recording.find({}, (err, recordings) => {
        if (err)
          console.log(err);
        res.render('admin/session', {recordings: recordings, moment: moment, message: req.flash('message')});
    });


  });

  router.get('/create_session', isLoggedInAsAdmin, (req, res) => {
  	res.render('admin/create_session', {message: req.flash('message')});
  });

  router.post('/create_session', isLoggedInAsAdmin, (req, res) => {
    Recording.findOne({'title': req.body.title}, (err, recording) => {
      if (err)
        console.log(err);
      if (recording) {
        req.flash('message', 'This session title is already existed !');
        res.redirect('/create_session');
      } else {
        let newRecording = new Recording();
        newRecording.title = req.body.title;
        newRecording.description = req.body.description;
        newRecording.type = req.body.type;
        if (req.body.type == "words" || req.body.type == "sentences") {
          newRecording.content = formatContent(req.body.content);
        } else {
          newRecording.content = req.body.content;
        }

        // save the recording
        newRecording.save((err) => {
            if (err)
                throw err;
            req.flash('message', 'Successfully create a new session');
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
  let contentArray = content.split('\r\n');
  for (let i = 0; i < contentArray.length; i++) {
    let newValue = contentArray[i].trim();
    contentArray[i] = newValue;
  }
  return contentArray;
}
