import fs from 'fs';

function writeToDisk(dataURL, fileName) {
    const fileExtension = fileName.split('.').pop();
    const fileRootNameWithBase = `./uploads/${fileName}`;
    let filePath = fileRootNameWithBase;
    let fileID = 2;
    let fileBuffer;
    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = `${fileRootNameWithBase}(${fileID}).${fileExtension}`;
        fileID += 1;
    }

    const data = dataURL.split(',').pop();
    fileBuffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, fileBuffer);

    console.log('filePath', filePath);
}

// define constructor function that gets `io` send to it
module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('incomingdata', (data) => {
            // console.log(data.audio.dataURL);
            writeToDisk(data.audio.dataURL, 'testing.wav');
            // console.log(data);
        });
    });
};
