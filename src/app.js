import express from 'express';
import sass from 'node-sass-middleware';
import mongoose from 'mongoose';
import passport from 'passport';
import flash from 'connect-flash';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
// import configDB from './config/database';

dotenv.config();
const app = express();
// Setup SocketIO
const server = require('http').Server(app);
const io = require('socket.io')(server);
const MongoStore = require('connect-mongo')(session);

// Setup database connection
mongoose.Promise = global.Promise; // use ES6 promise
if (process.env.NODE_ENV == 'testing') {
  mongoose.connect(process.env.TESTING_DATABASE_URI); // connect to remote test database
} else {
  mongoose.connect(process.env.DATABASE_URI); // connect to remote database
}
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  if (process.env.NODE_ENV == 'testing') {
    console.log('Successfully connect to test database');
  } else {
    console.log('Successfully connect to database');
  }
});
// import configDB from './config/database'; // local database configuration
// mongoose.connect(configDB.url) // connect to local databas

// Setup session + passportjs
require('./config/passport')(passport);
app.use(methodOverride('_method'));
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: false,
    cookie: {maxAge: 864000000},
    store: new MongoStore({ mongooseConnection: mongoose.connection },
    (err) => {
        console.log(err);
    }),
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in sesresion

// Setup assets
app.use(sass({
    /* Options */
    src: path.join(__dirname, '../public/sass'),
    dest: path.join(__dirname, '../public/stylesheets'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix: '/stylesheets',
}));

app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));

// Setup route handler
app.use(require('./routes/index')(passport));
app.use(require('./routes/user')(passport));
app.use(require('./routes/admin')(passport));
app.use(require('./routes/reminder')(passport));
app.use(require('./routes/manuals')(passport));
// app.use(require('./routes/error'));
app.use((req, res, next) => {
    res.status(404).render('404');
});

// Misc
require('./record.js')(io);
require('./cron.js');

io.on('connection', (socket) => {
    console.log('Establishing socketio connection...');
    socket.emit('user', 'Did you hear me ?');
});

app.set('port', process.env.PORT || 3000);
server.listen(app.get('port'), () => {
    console.log(`Example app listening on port ${app.get('port')}`);
});

module.exports = server;
