import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import ChessboardWebgl from './taxtak/index';
import { signInAnonymously } from '../firebase';
import { setToken, connectToFree } from '../actions/cloud';
import { restoreAllPgnArr } from '../actions/board';
import { recoverLastSession } from '../utils/utils';
import { useLocation, useHistory } from 'react-router-dom';

const MainPage = ({
  setToken,
  connectToFree,
  restoreAllPgnArr,
}) => {
  const { pathname, search } = useLocation();
  const history = useHistory();
  useEffect(() => {
    if (search.length && pathname === '/analysis') {
      history.replace({ pathname: pathname, search: search });
    }
  }, [pathname, search]);

  useEffect(() => {
    signInAnonymously().then((idToken) => {
      recoverLastSession(restoreAllPgnArr);
    });
  }, []);

  useEffect(() => {
    signInAnonymously().then((idToken) => {
      setToken(idToken);
      // connectToFree();
    });
  });

  return <ChessboardWebgl />;
};

export default connect(null, {
  setToken,
  connectToFree,
  restoreAllPgnArr,
})(MainPage);
