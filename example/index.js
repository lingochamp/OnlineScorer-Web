import React, {Component} from 'react';
import {render} from 'react-dom';

import './styles/theme.scss';

const recorder = window.llsRecorder;

const SECRET = 'test';
const APP_ID = 'test';

let audioBlob;

const QUESTIONS = [{
  type: 'readaloud',
  reftext: 'Hope is a good thing'
}, {
  type: 'readaloud',
  reftext: 'There are two or three classes on every weekday.'
}];

class App extends Component {
  constructor() {
    super();

    this.state = {
      questionIndex: 0,
      reupload: false
    };
  }

  handleInitApi = () => {
    recorder.init({
      secret: SECRET,
      appId: APP_ID
    });
  }

  handleStartRecord = () => {
    recorder.startRecord(QUESTIONS[this.state.questionIndex]);
    this.setState({
      result: null,
      audioUrl: null
    });
  }

  handleStopRecord = () => {
    recorder.stopRecord({
      getResult: this.handleGetResult,
      getAudio: this.handleGetAudio
    });
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
      reupload: false
    });

    recorder.reupload({
      audioBlob,
      getResult: this.handleGetResult,
      question: QUESTIONS[this.state.questionIndex]
    });
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
      </div>
    );
  }
}

render(<App/>, document.getElementById('page'));
