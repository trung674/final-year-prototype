'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the schema for our activity model
var activitySchema = _mongoose2.default.Schema({
    _user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
    _recording: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Recording' }
}, { timestamps: true });

// create the model for users and expose it to our ap
// export default mongoose.model('Activity', activitySchema ); // this did work with Mocha for God-know reason
module.exports = _mongoose2.default.model('Activity', activitySchema); // that is why this line exists