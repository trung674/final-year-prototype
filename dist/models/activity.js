'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the schema for our activity model
var activitySchema = _mongoose2.default.Schema({
    _user: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'User' },
    _recording: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Recording' }
}, { timestamps: true });

// create the model for users and expose it to our ap
exports.default = _mongoose2.default.model('Activity', activitySchema);