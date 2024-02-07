import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ChessboardWebgl from './taxtak/index';
import { signInAnonymously } from '../firebase';
import { setToken } from '../actions/cloud';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { getHelmetInfo } from '../utils/utils';

const MainPage = ({ setToken }) => {
  const [helmetTitle, setHelmetTitle] = useState('');
  const [helmetContent, setHelmetContent] = useState('');
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (search.length && location.pathname.includes('/analysis')) {
      navigate({ pathname: location.pathname, search: search });
    } else if (location.pathname.includes('/analysis')) {
      navigate({ pathname: location.pathname });
    }
  }, [pathname, search]);

  useEffect(() => {
    const { title, description } = getHelmetInfo(location.pathname);
    setHelmetTitle(title);
    setHelmetContent(description);
  }, [location.pathname]);

  useEffect(() => {
    signInAnonymously().then((idToken) => {
      if (idToken) {
        setToken(idToken);
      }
    });
  });

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta property="og:title" content={helmetTitle} />
        <meta name="description" content={helmetContent} />
        <meta name="og:description" content={helmetContent} />
      </Helmet>
      <ChessboardWebgl />
    </>
  );
};

export default connect(null, {
  setToken,
})(MainPage);
