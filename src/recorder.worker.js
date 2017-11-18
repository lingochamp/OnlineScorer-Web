import getMeta from './getMeta';
import getResult from './getResult';

const OUTPUT_SAMPLE_RATE = 16000;

let websocket;
let recordBuffers;
let recordTotalLength;
let sampleRate;

self.addEventListener('message', e => {
  switch (e.data.command) {
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
    case 'stop':
      stop();
      break;
    case 'reupload':
      reupload(e.data.config);
      break;
    default:
      break;
  }
});

function init(config) {
  const {secret, serverUrl, recordItem, appId} = config;

  websocket = new WebSocket(serverUrl);
  recordBuffers = [];
  recordTotalLength = 0;
  sampleRate = config.sampleRate;

  websocket.onmessage = onGetResult;

  websocket.onerror = e => {
    self.postMessage({
      command: 'websocketError',
      data: e
    });
  };

  websocket.onopen = () => {
    // Tell recorder websocket is open, can send data now
    self.postMessage({
      command: 'websocketInitSucc'
    });

    sendHead(recordItem, secret, appId);
  };
}

function record(inputBuffer) {
  const resampledBuffer = resample2(inputBuffer);

  recordBuffers.push(resampledBuffer);
  recordTotalLength += resampledBuffer.length;
  send(resampledBuffer);
}

function stop() {
  // Check ready state
  if (!websocket || websocket.readyState !== 1) {
    return;
  }
  // Send EOF
  sendEOF();

  const audioBlob = exportAudio();
  postMessage({
    command: 'exportAudio',
    data: audioBlob
  });
}

function reupload(config) {
  const {secret, serverUrl, recordItem, appId} = config;
  websocket = new WebSocket(serverUrl);
  sampleRate = config.sampleRate;

  websocket.onmessage = onGetResult;

  websocket.onerror = e => {
    postMessage({
      command: 'websocketError',
      data: e
    });
  };

  websocket.onopen = () => {
    sendHead(recordItem, secret, appId);

    // Convert blob to buffer
    const reader = new FileReader();

    reader.addEventListener('loadend', () => {
      const resultBuffer = reader.result;
      websocket.send(resultBuffer);

      sendEOF();
    });

    reader.readAsArrayBuffer(config.audioBlob);
  };
}

function onGetResult(event) {
  const reader = new FileReader();

  reader.addEventListener('loadend', () => {
    const resultBuffer = reader.result;
    try {
      const resultView = new DataView(resultBuffer);
      const metaLen = resultView.getUint32(0);
      const meta = extractResult(resultBuffer, metaLen, 4);
      postMessage({
        command: 'getResult',
        data: getResult(meta)
      });
    } catch (e) {
      postMessage({
        command: 'getResult',
        data: {
          status: -100,
          success: false,
          msg: `服务器结果解析错误: ${e}`
        }
      });
    }
  });
  reader.readAsArrayBuffer(event.data);
}

function extractResult(resultBuffer, metaLen, metaStartPos) {
  const bufView = new Uint8Array(resultBuffer);
  const metaBufView = bufView.subarray(metaStartPos, metaStartPos + metaLen);
  return eval('(' + String.fromCharCode.apply(null, metaBufView) + ')'); // eslint-disable-line no-eval
}

function resample2(buf) {
  let s = 0;
  const o = sampleRate / OUTPUT_SAMPLE_RATE;
  const u = Math.ceil(buf.length * OUTPUT_SAMPLE_RATE / sampleRate);
  const a = new Float32Array(u);
  for (let i = 0; i < u; i++) {
    a[i] = buf[Math.floor(s)];
    s += o;
  }

  return a;
}

function sendHead(item, secret, appId) {
  const meta = getMeta(item, secret, appId);
  const metaLen = meta.length;

  const headBuffer = new ArrayBuffer(4 + metaLen);
  const view = new DataView(headBuffer);
  view.setUint32(0, metaLen, false);

  writeString(view, 4, meta);
  websocket.send(headBuffer);
}

function send(inputBuffer) {
  if (websocket.readyState === 1) {
    const mediaBuffer = transformToPCM(inputBuffer);
    websocket.send(mediaBuffer);
  }
  // TODO: websocket is not ready yet
}

function sendEOF() {
  const eof = new ArrayBuffer(3);
  const eofView = new Uint8Array(eof);
  eofView[0] = 0x45;
  eofView[1] = 0x4f;
  eofView[2] = 0x53;

  if (websocket.readyState === 1) {
    websocket.send(eof);
  }
}

function transformToPCM(samples) {
  const buffer = new ArrayBuffer(samples.length * 2);
  floatTo16BitPCM(new DataView(buffer), 0, samples);
  return buffer;
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples) {
  const doubleSampleLen = 2 * samples.length;
  const buffer = new ArrayBuffer(44 + doubleSampleLen);
  const view = new DataView(buffer);
  const sampleRate = OUTPUT_SAMPLE_RATE;
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* File length */
  view.setUint32(4, 36 + doubleSampleLen, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* Format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* Format chunk length */
  view.setUint32(16, 16, true);
  /* Sample format (raw) */
  view.setUint16(20, 1, true);
  /* Channel count */
  view.setUint16(22, 1, true);
  /* Sample rate */
  view.setUint32(24, sampleRate, true);
  /* Byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* Block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* Bits per sample */
  view.setUint16(34, 16, true);
  /* Data chunk identifier */
  writeString(view, 36, 'data');
  /* Data chunk length */
  view.setUint32(40, doubleSampleLen, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}

function mergeBuffers(recBuffers, recLength) {
  const result = new Float32Array(recLength);
  let offset = 0;
  for (let i = 0; i < recBuffers.length; i++) {
    result.set(recBuffers[i], offset);
    offset += recBuffers[i].length;
  }
  return result;
}

function exportAudio() {
  const buffers = mergeBuffers(recordBuffers, recordTotalLength);
  const dataview = encodeWAV(buffers);
  return new Blob([dataview], {type: 'audio/wav'});
}
