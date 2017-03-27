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

const job = new CronJob('00 47 23 * * *', () => {
    console.log('Start job');

    let start = moment().startOf('day');
    let end = moment().endOf('day');
    Reminder.find({date: {$gte: start, $lt: end}}).populate('_user _recording')
      .then((reminders) => {
        reminders.forEach((reminder) => {
            let mailOptions = {
              from: '"Web Recorder Team - University of Sheffield" <allenwalker2160@gmail.com>', // sender address
              to: reminder._user.email, // list of receivers
              subject: '(noreply) Recording Reminder', // Subject line
              text: `Hello ${reminder._user.information.fullname},
                     This is a friendly reminder that you have set up before.
                     Recording session: ${reminder._recording.title}
                     Message: ${reminder.message}`, // plain text body
              html: `Hello ${reminder._user.information.fullname}, <br />
                     This is a friendly reminder that you have set up on ${reminder.createdAt}. <br />
                     Recording session: ${reminder._recording.title} <br />
                     Message: ${reminder.message}` // html body
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
