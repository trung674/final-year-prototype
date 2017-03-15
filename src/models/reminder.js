import mongoose from 'mongoose';

// define the schema for our session model
// change to reminder
const reminderSchema = mongoose.Schema({
    message: String,
    date: Date,
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _recording: {type: mongoose.Schema.Types.ObjectId, ref: 'Recording'}
},
{ timestamps: true }
);

// create the model for users and expose it to our ap
export default mongoose.model('Reminder', reminderSchema);
