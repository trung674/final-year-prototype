import fs from 'fs-extra';
import moment from 'moment';

function writeToDisk(audio) {
    let dateTime = moment().format('YYYYMMDDHHmm');
    const fileExtension = 'wav';
    const fileName = `${audio.word}_${audio.username}_${audio.recordingID}_${dateTime}.${fileExtension}`;
    const filePath = `./uploads/${audio.username}/${audio.recordingID}/${fileName}`;
    let fileBuffer;
    let dataURL = audio.dataURL.split(',').pop();

    fileBuffer = Buffer.from(dataURL, 'base64');
    fs.outputFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}

// define constructor function that gets `io` send to it
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('incomingdata', (data) => {
            // console.log(data.audio.dataURL);
            writeToDisk(data.audio);
            // console.log(data);
        });
    });
};
