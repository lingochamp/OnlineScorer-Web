const RecorderWorker = require('worker-loader?inline!./recorderWorker');

class Recorder {
  recording = false;

  callbacks = {
    exportAudio: [],
    getResult: []
  };

  constructor(source, config = {}) {
    const bufferLen = config.bufferLen || 4096;
    this.serverUrl = config.serverUrl;
    this.secret = config.secret;
    this.appId = config.appId;
    this.context = source.context;
    const node = (this.context.createScriptProcessor ||
      this.context.createJavaScriptNode).call(this.context, bufferLen, 1, 1);

    this.worker = new RecorderWorker();
    this.worker.onmessage = e => {
      const {command, data} = e.data;
      this.recording = false;

      if (command === 'websocketError') {
        throw new Error('websocket 连接失败');
      } else if (command === 'getResult' && data.status === -20 && this.recording) {
        this.recording = false; // Stop recording
      }

      const cb = this.callbacks[command].pop();
      if (typeof cb === 'function') {
        cb(data);
      }
    };

    node.onaudioprocess = e => {
      if (!this.recording) {
        return;
      }
      const buffer = e.inputBuffer.getChannelData(0);
      this.worker.postMessage({
        command: 'record',
        buffer
      });
    };

    source.connect(node);
    node.connect(this.context.destination);
  }

  record({question, getAudio, getResult}) {
    this.recording = true;

    this.callbacks.exportAudio.push(getAudio);
    this.callbacks.getResult.push(getResult);

    this.worker.postMessage({
      command: 'init',
      config: {
        secret: this.secret,
        serverUrl: this.serverUrl,
        appId: this.appId,
        recordItem: question,
        sampleRate: this.context.sampleRate
      }
    });
  }

  stop() {
    this.recording = false;

    this.worker.postMessage({
      command: 'stop'
    });
  }

  reupload({audioBlob, question, getResult}) {
    this.callbacks.getResult.push(getResult);

    this.worker.postMessage({
      command: 'reupload',
      config: {
        audioBlob,
        recordItem: question,
        secret: this.secret,
        serverUrl: this.serverUrl,
        appId: this.appId,
        sampleRate: this.context.sampleRate
      }
    });
  }
}

export default Recorder;
