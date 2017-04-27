'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// define the schema for our user model
var userSchema = _mongoose2.default.Schema({
    email: String,
    username: String,
    password: String,
    information: {
        fullname: String,
        gender: String,
        date_of_birth: Date,
        place_of_birth: String,
        first_language: String,
        medical_condition: String
    },
    records: [{
        _id: false,
        _recording: { type: _mongoose2.default.Schema.Types.ObjectId, ref: 'Recording' },
        path: String,
        isFinished: Boolean,
        lastVisited: Date
    }],
    admin: Boolean,
    lastLogIn: Date
}, { timestamps: true });

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return _bcryptNodejs2.default.hashSync(password, _bcryptNodejs2.default.genSaltSync(8), null);
};

// checking if password is valid
// strange error when using this.password directly, instead passing second parameter userPassword as this.password
userSchema.methods.validPassword = function (password, userPassword) {
    return _bcryptNodejs2.default.compareSync(password, userPassword);
};

// checking if user is admin
userSchema.methods.isAdmin = function (admin) {
    return admin ? true : false;
};

// create the model for users and expose it to our app
module.exports = _mongoose2.default.model('User', userSchema);

// export default mongoose.model('User', userSchema);