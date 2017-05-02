'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// AWS.config.loadFromPath('./aws-config.json');
var config = new _awsSdk2.default.Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "eu-west-2"
});
var s3 = new _awsSdk2.default.S3(config);
var bucketName = 'recording.uploads';
function uploadToS3(audio) {
    var dateTime = (0, _moment2.default)().format('YYYYMMDDHHmm');
    var fileExtension = 'wav';
    var fileName = audio.word + '_' + audio.username + '_' + audio.recordingID + '_' + dateTime + '.' + fileExtension;
    var filePath = './uploads/' + audio.username + '/' + audio.recordingID + '/' + fileName;
    var filePathAWS = 'uploads/' + audio.username + '/' + audio.recordingID + '/' + fileName;
    var fileBuffer = void 0;
    var dataURL = audio.dataURL.split(',').pop();

    fileBuffer = Buffer.from(dataURL, 'base64');
    s3.putObject({ Bucket: bucketName, Key: filePathAWS, Body: fileBuffer, ContentEncoding: 'base64', ContentType: 'audio/wav' }, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log('uploading to S3 successfully !');
        }
    });
    // fs.outputFileSync(filePath, fileBuffer);
    // console.log('filePath', filePath);
}

// define constructor function that gets `io` send to it
module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.on('incomingdata', function (data, fn) {
            fn(true);
            uploadToS3(data.audio);
        });
    });
};