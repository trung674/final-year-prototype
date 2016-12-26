// var express  = require('express');
// var app      = express();
// var sass     = require('node-sass-middleware');
// var mongoose = require('mongoose');
// var passport = require('passport');
// var flash    = require('connect-flash');
// var morgan      = require('morgan');
// var bodyParser  = require('body-parser');
// var session     = require('express-session');

import express from 'express';
import sass from 'node-sass-middleware';
import mongoose from 'mongoose';
import passport from 'passport';
import flash from 'connect-flash';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';

const app = express();
import configDB from './config/database';
// var configDB = require('./config/database.js');
mongoose.Promise = global.Promise; //use ES6 promise
mongoose.connect(configDB.url); // connect to our database


require('./config/passport')(passport);
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'secretkey',
  resave: true,
  saveUninitialized: false
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.set('port', process.env.PORT || 3000);
app.use(require('./routes/index')(passport));
app.use(require('./routes/user')(passport));

app.use(sass({
    /* Options */
    src: path.join(__dirname, '../public/sass'),
    dest: path.join(__dirname, '../public/stylesheets'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix:  '/stylesheets'
}));

app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

app.listen(app.get('port'), () => {
  console.log('Example app listening on port ' + app.get('port'));
});
