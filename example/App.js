import React, {Component} from 'react';
import recorder from '../src/index';

import './styles/theme.scss';

let audioBlob;

const QUESTIONS = [{
  type: 'readaloud',
  reftext: 'Hope is a good thing',
  targetAudience: 0
}, {
  type: 'readaloud',
  reftext: 'There are two or three classes on every weekday.'
}];

class App extends Component {
  constructor() {
    super();

    this.state = {
      questionIndex: 0,
      reupload: false,
      statusMessage: 'Wait to Init'
    };
  }

  handleInitApi = () => {
    const {secret, appId} = this.state;
    recorder.init({
      secret,
      appId
    }).then(() => {
      this.setState({
        statusMessage: 'Recorder Init Finished'
      });
    });
  }

  handleStartRecord = () => {
    recorder.startRecord({
      question: QUESTIONS[this.state.questionIndex],
      getResult: this.handleGetResult,
      getAudio: this.handleGetAudio
    }).then(() => {
      this.setState({
        statusMessage: 'Start Recording'
      });
    });

    this.setState({
      result: null,
      audioUrl: null
    });
  }

  handleStopRecord = () => {
    this.setState({
      statusMessage: 'Stop Recording'
    });
    recorder.stopRecord();
  }

  handleGetAudio = audio => {
    if (!this.state.reupload) {
      audioBlob = audio;
    }

    const audioUrl = window.URL.createObjectURL(audio);
    this.setState({
      audioUrl
    });
  }

  handleGetResult = result => {
    this.setState({
      result
    });

    this.setState({
      reupload: true
    });
  }

  handleSwitchQuestion = () => {
    this.setState({
      questionIndex: (this.state.questionIndex + 1) % 2
    });
  }

  handleReupload = () => {
    this.setState({
      result: null,
      reupload: false,
      statusMessage: 'Reupload'
    });

    recorder.reupload({
      audioBlob,
      getResult: this.handleGetResult,
      question: QUESTIONS[this.state.questionIndex]
    });
  }

  handleAppIdChange = e => {
    this.setState({
      appId: e.target.value
    });
  }

  handleSecretChange = e => {
    this.setState({
      secret: e.target.value
    });
  }

  handleClose = () => {
    recorder.close();
  }

  renderReupload() {
    if (this.state.reupload) {
      return (
        <button
          className="api-test-btn"
          onClick={this.handleReupload}
        >
          Reupload {this.state.audioUrl}
        </button>
      );
    }
  }

  renderAudio() {
    if (this.state.audioUrl) {
      return (
        <div>
          <a href={this.state.audioUrl} download="record.wav">record.wav</a>
          <audio controls src={this.state.audioUrl}/>
        </div>
      );
    }
  }

  renderResult() {
    if (this.state.result) {
      return (
        <div>
          <h3>Result</h3>
          <pre>{JSON.stringify(this.state.result)}</pre>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="native-apis-list">
        {this.state.statusMessage}
        <input
          className="api-test-input"
          placeholder="appId"
          onChange={this.handleAppIdChange}
        />
        <input
          className="api-test-input"
          placeholder="secret(密码)"
          onChange={this.handleSecretChange}
        />
        <button
          className="api-test-btn"
          onClick={this.handleInitApi}
        >
          init
        </button>
        <button
          className="api-test-btn"
          onClick={this.handleStartRecord}
        >
          Start Record
        </button>
        <button
          className="api-test-btn"
          onClick={this.handleStopRecord}
        >
          Stop Record
        </button>
        {this.renderReupload()}
        {this.renderResult()}
        {this.renderAudio()}
        <button
          className="api-test-btn"
          onClick={this.handleSwitchQuestion}
        >
          Switch question
        </button>
        <pre>{JSON.stringify(QUESTIONS[this.state.questionIndex])}</pre>
        <button
          className="api-test-btn"
          onClick={this.handleClose}
        >
          Close Recorder
        </button>
      </div>
    );
  }
}

export default App;
