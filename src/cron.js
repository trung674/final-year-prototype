import moment from 'moment';
import nodemailer from 'nodemailer';
import Reminder from './models/reminder';
const CronJob = require('cron').CronJob;

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

// verify connection configuration
transporter.verify(function(error, success) {
   if (error) {
        console.log(error);
   } else {
        console.log('Server is ready to take our messages');
   }
});

const job = new CronJob('00 00 14 * * *', () => {
    console.log('Start job');

    let start = moment().startOf('day');
    let end = moment().endOf('day');
    Reminder.find({date: {$gte: start, $lt: end}}).populate('_user _recording')
      .then((reminders) => {
        reminders.forEach((reminder) => {
            let mailOptions = {
              from: `"Web Recorder Team - University of Sheffield" <${process.env.GMAIL_USERNAME}>`, // sender address
              to: reminder._user.email, // list of receivers
              subject: '(noreply) Recording Reminder', // Subject line
              text: `Hello ${reminder._user.information.fullname || reminder._user.username},
                     This is a friendly reminder that you have set up on ${moment(reminder.createdAt).format('MMMM Do YYYY')}. <br />
                     <strong>Your last recording session</strong>: <a href='https://web-recorder-uos.herokuapp.com/user/session/${reminder._recording._id}/0?a=continue'>${reminder._recording.title}</a>
                     <strong>Message</strong>: ${reminder.message || 'You left no message.'} <br />
                     Kind regards, <br />
                     Web Recorder Team - The University of Sheffield`,
              html: `Hello ${reminder._user.information.fullname || reminder._user.username}, <br />
                     This is a friendly reminder that you have set up on ${moment(reminder.createdAt).format('MMMM Do YYYY')}. <br /><br />
                     <strong>Your last recording session</strong>: <a href='https://web-recorder-uos.herokuapp.com/user/session/${reminder._recording._id}/0?a=continue'>${reminder._recording.title}</a> <br />
                     <strong>Message</strong>: ${reminder.message || 'You left no message.'} <br /><br />
                     Kind regards, <br />
                     Web Recorder Team - The University of Sheffield` // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
            });
        });
      })
      .catch((err) => {
        console.log(err);
      });
},
false, /* Start the job right now */
);

job.start();
console.log('job status', job.running); // job status
