'use strict';

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _reminder = require('./models/reminder');

var _reminder2 = _interopRequireDefault(_reminder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CronJob = require('cron').CronJob;

// create reusable transporter object using the default SMTP transport
var transporter = _nodemailer2.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages');
    }
});

var job = new CronJob('00 00 14 * * *', function () {
    console.log('Start job');

    var start = (0, _moment2.default)().startOf('day');
    var end = (0, _moment2.default)().endOf('day');
    _reminder2.default.find({ date: { $gte: start, $lt: end } }).populate('_user _recording').then(function (reminders) {
        reminders.forEach(function (reminder) {
            var mailOptions = {
                from: '"Web Recorder Team - University of Sheffield" <' + process.env.GMAIL_USERNAME + '>', // sender address
                to: reminder._user.email, // list of receivers
                subject: '(noreply) Recording Reminder', // Subject line
                text: 'Hello ' + (reminder._user.information.fullname || reminder._user.username) + ',\n                     This is a friendly reminder that you have set up on ' + (0, _moment2.default)(reminder.createdAt).format('MMMM Do YYYY') + '. <br />\n                     <strong>Your last recording session</strong>: <a href=\'https://web-recorder-uos.herokuapp.com/user/session/' + reminder._recording._id + '/0?a=continue\'>' + reminder._recording.title + '</a>\n                     <strong>Message</strong>: ' + (reminder.message || 'You left no message.') + ' <br />\n                     Kind regards, <br />\n                     Web Recorder Team - The University of Sheffield',
                html: 'Hello ' + (reminder._user.information.fullname || reminder._user.username) + ', <br />\n                     This is a friendly reminder that you have set up on ' + (0, _moment2.default)(reminder.createdAt).format('MMMM Do YYYY') + '. <br /><br />\n                     <strong>Your last recording session</strong>: <a href=\'https://web-recorder-uos.herokuapp.com/user/session/' + reminder._recording._id + '/0?a=continue\'>' + reminder._recording.title + '</a> <br />\n                     <strong>Message</strong>: ' + (reminder.message || 'You left no message.') + ' <br /><br />\n                     Kind regards, <br />\n                     Web Recorder Team - The University of Sheffield' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
            });
        });
    }).catch(function (err) {
        console.log(err);
    });
}, false);

job.start();
console.log('job status', job.running); // job status