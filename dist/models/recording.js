'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the schema for our session model
// change to recording
var recordingSchema = _mongoose2.default.Schema({
    title: String,
    description: String,
    type: String,
    content: [String]
}, { timestamps: true });

// create the model for users and expose it to our ap
// export default mongoose.model('Recording', recordingSchema); // this did work with Mocha for God-know reason
module.exports = _mongoose2.default.model('Recording', recordingSchema); // that is why this line exists