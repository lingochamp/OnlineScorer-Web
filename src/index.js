import Recorder from './Recorder';
const SERVER_URL = 'wss://openapi.llsapp.com/openapi/stream/upload';

let audioContext;
let recorder;

function __log(e, data) {
  console.log(e + ' ' + (data || ''));
}

// TODO: check websocket support
function init({secret, appId}) {
  return new Promise((succ, rej) => {
    if (!secret) {
      rej(new Error('secret is empty'));
      return;
    }

    if (!appId) {
      rej(new Error('appId is empty'));
      return;
    }

    initAudioSetting().then(stream => {
      const input = audioContext.createMediaStreamSource(stream);
      recorder = new Recorder(input, {
        secret,
        appId,
        serverUrl: SERVER_URL
      });

      __log('Recorder initialised.');
      succ();
    }).catch(e => {
      rej(e);
    });
  });
}

function startRecord(config) {
  if (!recorder) {
    const err = new Error('Recorder is not initialised');
    throw err;
  }
  recorder.record(config);
}

function stopRecord() {
  return recorder.stop();
}

function reupload(config) {
  return recorder.reupload(config);
}

function initAudioSetting() {
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
    return Promise.reject(e);
  }

  return navigator.mediaDevices.getUserMedia({audio: true, video: false});
}

module.exports = {
  init,
  startRecord,
  stopRecord,
  reupload
};
