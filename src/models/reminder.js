import mongoose from 'mongoose';

// define the schema for Reminder
const reminderSchema = mongoose.Schema({
    message: String,
    date: Date,
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _recording: {type: mongoose.Schema.Types.ObjectId, ref: 'Recording'}
},
{ timestamps: true }
);

// create the model for users and expose it to our app
// export default mongoose.model('Reminder', reminderSchema); // this did work with Mocha for God-know reason
module.exports = mongoose.model('Reminder', reminderSchema); // that is why this line exists
