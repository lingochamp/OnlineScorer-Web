import Recorder from './Recorder';
const SERVER_URL = 'wss://rating.llsstaging.com/openapi/stream/upload';

let audioContext;
let recorder;

function __log(e, data) {
  console.log(e + ' ' + (data || ''));
}

// TODO: check websocket support
function init({secret, appId}) {
  if (!secret) {
    throw new Error('secret is empty');
  }

  if (!appId) {
    throw new Error('appId is empty');
  }

  initAudioSetting(stream => {
    const input = audioContext.createMediaStreamSource(stream);
    recorder = new Recorder(input, {
      secret,
      appId,
      serverUrl: SERVER_URL
    });

    __log('Recorder initialised.');
  });
}

function startRecord(item) {
  if (!recorder) {
    const err = new Error('Recorder is not initialised');
    throw err;
  }
  recorder.record(item);
}

function stopRecord(config) {
  return recorder.stop(config);
}

function reupload(config) {
  return recorder.reupload(config);
}

function initAudioSetting(startUserMediaCallback) {
  try {
    // Webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia !== 'function') {
      navigator.mediaDevices.getUserMedia = constraints => {
        const getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(
            new Error('getUserMedia is not supported in this browser')
          );
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    audioContext = new AudioContext();
    __log('Audio context set up.');
    __log('navigator.getUserMedia ' + (navigator.mediaDevices.getUserMedia ? 'available.' : 'not present!'));
  } catch (e) {
    throw new Error('No web audio support in this browser!');
  }

  navigator.mediaDevices.getUserMedia({audio: true, video: false})
    .then(startUserMediaCallback)
    .catch(e => {
      __log('No live audio input: ' + e);
    });
}

module.exports = {
  init,
  startRecord,
  stopRecord,
  reupload
};
