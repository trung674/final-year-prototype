'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

module.exports = function (passport) {
	router.get('/manuals', isLoggedIn, function (req, res, next) {
		res.render('manuals/manuals');
	});

	return router;
};

function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) return next();
	// if they aren't redirect them to the home page
	res.redirect('/signin');
}