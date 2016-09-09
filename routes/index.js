var express = require('express');
var router = express.Router();


module.exports = function(passport){
  router.get('/', function (req, res) {
    res.render('index', { message: req.flash('message') });
  });

  router.post('/', passport.authenticate('signup', {
    successRedirect : '/',
    failureRedirect: '/',
    failureFlash : true
  }));

	return router;
}
