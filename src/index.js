// React Required
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store/index';
import * as Sentry from "@sentry/react";

// Create Import File
import './index.scss';

// Home layout
import App from './App';

import { BrowserRouter, Switch, Route } from 'react-router-dom';

import ReactGA from 'react-ga';

(function initAnalytics() {
  const TRACKING_ID = "UA-80270327-2";
  ReactGA.initialize(TRACKING_ID);
})();

Sentry.init({
  dsn: "https://d2b51555fa8447c2bebb59afcca7256c@o4505238722314240.ingest.sentry.io/4505238737125376",
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

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
