'use strict';

var recBtn = document.querySelector('button#rec');
var pauseResBtn = document.querySelector('button#pauseRes');
var stopBtn = document.querySelector('button#stop');

var errorElement = document.querySelector('#errorMsg');
var dataElement = document.querySelector('#data');
var soundClips = document.querySelector('div.sound-clips');
var canvas = document.querySelector('.visualizer');
var audioCtx = new (window.AudioContext || webkitAudioContext)();
var canvasCtx = canvas.getContext("2d");

var isSecureOrigin = location.protocol === 'https:' ||
location.host === 'localhost:3000';
if (!isSecureOrigin) {
  alert('getUserMedia() must be run from a secure origin: HTTPS or localhost.' +
    '\n\nChanging protocol to HTTPS');
  location.protocol = 'HTTPS';
}

// Media constraint
var constraints = window.constraints = {
  audio: true,
  video: false
};

function handleSuccess(mediaStream) {
  var audioTracks = mediaStream.getAudioTracks();
  console.log(mediaStream);
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);
  window.stream = mediaStream;
}

function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  } else if (error.name === 'DevicesNotFoundError') {
    errorMsg('No recording device found');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
  recBtn.disabled = true;
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

var socket = io.connect('http://localhost:3000');
socket.on('user', function(data){
  console.log(data);
  console.log("I heared you!");
});
/*
var mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
var sourceBuffer;
*/

var mediaRecorder;
var chunks = [];
var recordAudio;

function onBtnRecordClicked (){
  // startRecording
  recordAudio = new RecordRTC(window.stream, {type: 'audio'});
  recordAudio.startRecording();
	// recordAudio.setRecordingDuration(10);
  visualize(window.stream);
	pauseResBtn.textContent = "Pause";

	recBtn.disabled = true;
	pauseResBtn.disabled = false;
	stopBtn.disabled = false;
}

function onBtnStopClick(){
  recordAudio.stopRecording(function() {
      // get audio data-URL
      recordAudio.getDataURL(function(audioDataURL) {
          var files = {
              audio: {
                  type: recordAudio.getBlob().type || 'audio/wav',
                  dataURL: audioDataURL
              }
          };

      		//var videoURL = window.URL.createObjectURL(blob);
          var clipContainer = document.createElement('article');
          var audio = document.createElement('audio');

          clipContainer.classList.add('clip');
          audio.setAttribute('controls', '');

          clipContainer.appendChild(audio);
          soundClips.appendChild(clipContainer);
          audio.controls = true;
      		var audioURL = window.URL.createObjectURL(recordAudio.getBlob());
          audio.src = audioURL;
          socket.emit('incomingdata', files);
          // if (window.stream) window.stream.stop();
      });
  });
	// mediaRecorder.stop();
	//videoElement.controls = true;
	recBtn.disabled = false;
	pauseResBtn.disabled = true;
	stopBtn.disabled = true;
	downloadButton.disabled = false;
}

function onPauseResumeClicked(){
	if(pauseResBtn.textContent === "Pause"){
    recordAudio.pauseRecording();
		console.log("pause");
		pauseResBtn.textContent = "Resume";
		// mediaRecorder.pause();
		stopBtn.disabled = true;

	}else{
		console.log("resume");
    recordAudio.resumeRecording();
		pauseResBtn.textContent = "Pause";
		// mediaRecorder.resume();
		stopBtn.disabled = false;
	}
	recBtn.disabled = true;
	pauseResBtn.disabled = false;
}


function log(message){
	dataElement.innerHTML = dataElement.innerHTML+'<br>'+message ;
}

function download() {
  var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'test.ogg';
  a.click();
}

function visualize(stream) {
  var source = audioCtx.createMediaStreamSource(stream);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  var WIDTH = canvas.width
  var HEIGHT = canvas.height;

  draw()

  function draw() {

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / bufferLength;
    var x = 0;


    for(var i = 0; i < bufferLength; i++) {

      var v = dataArray[i] / 128.0;
      var y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}
