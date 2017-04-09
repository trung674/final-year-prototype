'use strict';

var btnRecord = $('#btn-record');
var btnBack = $('#btn-back');
var btnNext = $('#btn-next');
var btnFinish = $('#btn-finish');
var currentWord = $('#word').text();
var recordingStatus = $('#recording-status');
var recordingPanel = $('#recording-panel')

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
  $('#errorMsg').removeClass('hidden');
  btnRecord.addClass('hidden');
  btnBack.addClass('hidden');
  btnNext.addClass('hidden');
  if (error.name === 'PermissionDeniedError') {
    $('#errorMsg').text('Permissions have not been granted to use your ' +
      'microphone, you need to allow the page access to your device in ' +
      'order for the recording system to work.');

  } else if (error.name === 'DevicesNotFoundError') {
    $('#errorMsg').text('No microphone found ! If you are using a PC, you need an external microphone.');
  } else {
    $('#errorMsg').text('Something bad happened !');
  }
  //$('#errorMsg').text('getUserMedia error: ' + error.name, error);
  console.error('getUserMedia error: ' + error.name, error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

// var socket = io.connect('https://web-recorder-uos.herokuapp.com');
var socket = io();
socket.on('user', function(data){
  console.log(data);
  console.log("I heared you!");
});

var mediaRecorder;
var chunks = [];
var recordAudio;

function onBtnRecordClicked(){
  var timeout = 5000;
  var recordingType = recordingPanel.attr('data-recording-type');
  var isEndOfSession = recordingPanel.attr('data-end-of-session');
  // startRecording
  recordAudio = new RecordRTC(window.stream, {recorderType: StereoAudioRecorder, sampleRate: 44100, bufferSize: 4096});
  recordAudio.startRecording();

  if (isEndOfSession === 'false' && ((recordingType === 'sentences') || (recordingType === 'words'))) {
    if (recordingType === 'sentences') timeout = 10000;
    setTimeout(function() {
      saveAudio(false);
    }, timeout);
    countdownTimer(timeout);
  } else {
    var recordingCountdown = $('#recording-countdown');
    recordingCountdown.removeClass('hidden');
    recordingCountdown.text('This is the end of this recording session. Please click "Finish" button once you finish recording');
  }

  recordingStatus.text('Recording');
  recordingStatus.css('color', 'green');
  btnRecord.replaceWith("<a class='btn-control' id='btn-pause' onClick='onBtnPauseClicked()'><i class='fa fa-microphone fa-5x'></i></a>");
  $('.fa-microphone').css('color', 'green');
}

function onBtnNextClicked(){
  if (recordAudio) {
    saveAudio(false);
  } else {
    nextRecording();
  }
}

function onBtnPauseClicked(){
  $('#btn-pause').replaceWith("<a class='btn-control' id='btn-resume' onClick='onBtnResumeClicked()'><i class='fa fa-microphone fa-5x'></i></a>");
  $('.fa-microphone').css('color', 'red');
  recordingStatus.text('Pause');
  recordingStatus.css('color', 'red');
  recordAudio.pauseRecording();
	console.log("pause");
}

function onBtnResumeClicked(){
  $('#btn-resume').replaceWith("<a class='btn-control' id='btn-pause' onClick='onBtnPauseClicked()'><i class='fa fa-microphone fa-5x'></i></a>");
  $('.fa-microphone').css('color', 'green');
  recordingStatus.text('Recording');
  recordingStatus.css('color', 'green');
  recordAudio.resumeRecording();
  console.log("resume");
}

function onBtnFinishClicked(){
  saveAudio(true);
}

function saveAudio(isFinish){
  var recordingID = recordingPanel.attr('data-recording-id');
  var username = recordingPanel.attr('data-username');
  recordAudio.stopRecording(function() {
      // get audio data-URL
      recordAudio.getDataURL(function(audioDataURL) {
          var files = {
              audio: {
                  type: recordAudio.getBlob().type || 'audio/wav',
                  dataURL: audioDataURL,
                  word: currentWord,
                  username: username,
                  recordingID: recordingID
              }
          };
          socket.emit('incomingdata', files, function(status){
            if (status) {
              if (isFinish) {
                finishRecording();
              } else {
                nextRecording();
              }
            }
          });
      });
  });
}

function finishRecording(){
  var recordingID = recordingPanel.attr('data-recording-id');
  window.location.href = "/user/session/" + recordingID + "/finish"
}

function nextRecording(){
  var currentURL = window.location.pathname.split('/');
  var currentIndex = currentURL.pop();
  window.location.href = parseInt(currentIndex) + 1;
}

function countdownTimer(time) {
  var recordingCountdown = $('#recording-countdown');
  recordingCountdown.removeClass('hidden');
  var i = time / 1000;
  var interval = setInterval(function() {
    i -= 1;
    recordingCountdown.text('You will be move to the next item in ' + i + ' second(s).');
    if (i == 0) {
      clearInterval(interval);
    }
  }, 1000);
}
