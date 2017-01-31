import fs from 'fs';

// define constructor function that gets `io` send to it
module.exports = (io) => {
    io.on('connection', function(socket) {
      socket.on('incomingdata', (data) => {
        // console.log(data.audio.dataURL);
        writeToDisk(data.audio.dataURL, 'testing.wav');
        // console.log(data);
      });
    });
};
    
function writeToDisk(dataURL, fileName) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './uploads/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;
    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = Buffer.from(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}
