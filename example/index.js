import React  from 'react';
import {render} from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './App';

render(<App/>, document.getElementById('page'));

if (module.hot) {
  module.hot.accept('./App', () => {
    render(<App/>, document.getElementById('page'));
  });
}
