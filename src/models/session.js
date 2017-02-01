import mongoose from 'mongoose';

// define the schema for our user model
const sessionSchema = mongoose.Schema({
    title        : String,
    description  : String,
    type         : String,
    content     : [String]
},
{ timestamps: true }
);

// create the model for users and expose it to our app
// module.exports = mongoose.model('User', userSchema);

export default mongoose.model('Session', sessionSchema);
