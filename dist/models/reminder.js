'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the schema for Reminder
var reminderSchema = _mongoose2.default.Schema({
    message: String,
    date: Date,
    _user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
    _recording: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Recording' }
}, { timestamps: true });

// create the model for users and expose it to our ap
// export default mongoose.model('Reminder', reminderSchema);
module.exports = _mongoose2.default.model('Reminder', reminderSchema);