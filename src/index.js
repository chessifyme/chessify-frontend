// React Required
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/index';

// Create Import File
import './index.scss';

// Home layout
import App from './App';

import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

import * as Sentry from '@sentry/browser';
import ReactGA from 'react-ga';

Sentry.init({
  dsn: 'http://ca4ff549fe4b4e1dba0560d7bd5e3366@150.136.210.93:9000/6',
});

(function initAnalytics() {
  const TRACKING_ID = "UA-80270327-2";
  ReactGA.initialize(TRACKING_ID);
})();

class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        <BrowserRouter basename={'/'}>
          <App />
        </BrowserRouter>
      </Provider>
    );
  }
}

ReactDOM.render(<Root />, document.getElementById('root'));
serviceWorker.register();
