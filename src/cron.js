import moment from 'moment';
import Reminder from './models/reminder';
const CronJob = require('cron').CronJob;

const job = new CronJob('00 30 23 * * *', () => {
  console.log('Start job');
/*
 * Runs every weekday (Monday through Friday)
 * at 11:30:00 AM. It does not run on Saturday
 * or Sunday.
 */
 let now = moment().format();
 Reminder.find({date: {$lte: new Date(now)}})
   .then((reminder) => {
     console.log(reminder);
   })
   .catch((err) => {
     console.log(err);
   })
}, function () {
  /* This function is executed when the job stops */
  console.log('Job finished !');
},
true, /* Start the job right now */
);
