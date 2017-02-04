import mongoose from 'mongoose';

// define the schema for our session model
const sessionSchema = mongoose.Schema({
    title        : String,
    description  : String,
    type         : String,
    content     : [String]
},
{ timestamps: true }
);

// create the model for users and expose it to our ap
export default mongoose.model('Session', sessionSchema);
