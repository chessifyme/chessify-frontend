import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import MainPage from './components/MainPage.jsx';
import { Routes, Route } from 'react-router-dom';
import {
  getUserAccount,
  getUserServersInfo,
  getUserNotifictionInfo,
  getUserPlansInfo,
  setSubModal,
  setIsGuestUser,
} from './actions/cloud';
import {
  getUserAccountData,
  getUserServersData,
  getUserNotifiactionData,
  getUserPlansData,
} from './utils/api';
import { connectToPro } from './actions/cloud';
import NavBar from './components/NavBar.jsx';
import UserAccount from './components/UserAccount.jsx';
import PagePreloader from './components/common/PagePreloader.jsx';
import ThemeProvider from './providers/ThemeProvider';
import {
  restoreAllPgnArr,
  setAnalyzingFenTabIndx,
  setFen,
} from './actions/board';
import { recoverLastSession } from './utils/utils';
import { signInAnonymously } from './firebase';

const App = (props) => {
  const {
    getUserAccount,
    getUserServersInfo,
    getUserNotifictionInfo,
    getUserPlansInfo,
    connectToPro,
    setSubModal,
    setIsGuestUser,
    restoreAllPgnArr,
    setFen,
    setAnalyzingFenTabIndx,
  } = props;
  const [loading, setLoading] = useState(true);
  const loggedOut = localStorage.getItem('logged_out');

  const showLastSessionModal = async () => {
    return signInAnonymously().then((idToken) => {
      recoverLastSession(restoreAllPgnArr, setFen, setAnalyzingFenTabIndx);
    });
  };

  useEffect(() => {
    localStorage.setItem('logged_out', true);

    const multiRequests = async () => {
      try {
        const userDetaleInfo = await getUserAccountData();
        if (userDetaleInfo && userDetaleInfo.pieces_theme) {
          const head = document.head;
          const link = document.createElement('link');
          link.type = 'text/css';
          link.rel = 'stylesheet';
          link.href = `https://lichess1.org/assets/_TDotAa/piece-css/${userDetaleInfo.pieces_theme}.css`;
          head.appendChild(link);
        }
        const plans = await getUserPlansData();
        const notification = await getUserNotifiactionData();
        if (
          notification &&
          notification.notify_upgrade &&
          notification.subscription &&
          notification.subscription.from_ads
        ) {
          setSubModal('trial');
        } else if (
          notification &&
          notification.notify_upgrade &&
          !notification.subscription
        ) {
          setSubModal('after5Min');
        }
        if (notification && notification.notify_survey) {
          setSubModal('survey');
        }
        await showLastSessionModal();
        let servers = await getUserServersData();

        if (servers && servers.servers && Object.keys(servers.servers).length) {
          if (!Boolean(sessionStorage.getItem('tabs'))) {
            setSubModal('currently_analyzing');
          } else {
            connectToPro(servers.servers);
          }
        }
        getUserAccount(userDetaleInfo);
        getUserPlansInfo(plans);
        getUserNotifictionInfo(notification);
        getUserServersInfo(servers);
        setIsGuestUser(false);
      } catch (e) {
        console.log('SOMETHING WRONG WITH MULTI REQUESTS', e);
        setIsGuestUser(true);
        await showLastSessionModal();
      } finally {
        setLoading(false);
      }
    };

    multiRequests();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'logged_out' && event.oldValue === 'true') {
        localStorage.setItem('logged_out', 'false');
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loggedOut]);

  return loading ? (
    <PagePreloader />
  ) : (
    <ThemeProvider>
      <NavBar />
      <Routes>
        <Route
          exact
          path="/analysis/account_settings"
          element={<UserAccount />}
        />
        <Route exact path={`/analysis`} element={<MainPage />} />
        <Route exact path={`/analysis/chess-database`} element={<MainPage />} />
        <Route
          exact
          path={`/analysis/lichess-database`}
          element={<MainPage />}
        />
        <Route exact path={`/analysis/cloud-storage`} element={<MainPage />} />
        <Route exact path={`/analysis/video-search`} element={<MainPage />} />
        <Route
          exact
          path={`/analysis/chess-pdf-scanner`}
          element={<MainPage />}
        />
      </Routes>
    </ThemeProvider>
  );
};

export default connect(null, {
  getUserAccount,
  getUserServersInfo,
  getUserNotifictionInfo,
  getUserPlansInfo,
  connectToPro,
  setSubModal,
  setIsGuestUser,
  restoreAllPgnArr,
  setFen,
  setAnalyzingFenTabIndx,
})(App);
