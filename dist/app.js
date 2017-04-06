'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _nodeSassMiddleware = require('node-sass-middleware');

var _nodeSassMiddleware2 = _interopRequireDefault(_nodeSassMiddleware);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _connectFlash = require('connect-flash');

var _connectFlash2 = _interopRequireDefault(_connectFlash);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import configDB from './config/database';

_dotenv2.default.config();
var app = (0, _express2.default)();
// Setup SocketIO
var server = require('http').Server(app);
var io = require('socket.io')(server);
var MongoStore = require('connect-mongo')(_expressSession2.default);

// Setup database connection
_mongoose2.default.Promise = global.Promise; // use ES6 promise
_mongoose2.default.connect(process.env.DATABASE_URI); // connect to remote database
var db = _mongoose2.default.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Successfully connect to database');
});
// import configDB from './config/database'; // local database configuration
// mongoose.connect(configDB.url) // connect to local databas

// Setup session + passportjs
require('./config/passport')(_passport2.default);

app.use((0, _morgan2.default)('dev')); // log every request to the console
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use((0, _expressSession2.default)({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: _mongoose2.default.connection }, function (err) {
        console.log(err || 'connect-mongodb setup ok');
    })
})); // session secret
app.use(_passport2.default.initialize());
app.use(_passport2.default.session()); // persistent login sessions
app.use((0, _connectFlash2.default)()); // use connect-flash for flash messages stored in sesresion

// Setup assets
app.use((0, _nodeSassMiddleware2.default)({
    /* Options */
    src: _path2.default.join(__dirname, '../public/sass'),
    dest: _path2.default.join(__dirname, '../public/stylesheets'),
    debug: true,
    indentedSyntax: true,
    outputStyle: 'compressed',
    prefix: '/stylesheets'
}));

app.use(_express2.default.static(_path2.default.join(__dirname, '../public')));
app.set('view engine', 'pug');
app.set('views', _path2.default.join(__dirname, '../views'));

// Setup route handler
app.set('port', process.env.PORT || 3000);
app.use(require('./routes/index')(_passport2.default));
app.use(require('./routes/user')(_passport2.default));
app.use(require('./routes/admin')(_passport2.default));
app.use(require('./routes/reminder')(_passport2.default));
// app.use(require('./routes/error'));
app.use(function (req, res, next) {
    res.status(404).render('404');
});

// Misc
require('./record.js')(io);
require('./cron.js');

io.on('connection', function (socket) {
    console.log('Establishing socketio connection...');
    socket.emit('user', 'Did you hear me ?');
});

server.listen(app.get('port'), function () {
    console.log('Example app listening on port ' + app.get('port'));
});