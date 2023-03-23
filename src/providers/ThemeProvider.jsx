import React from 'react';
import { connect } from 'react-redux';
import { ThemeContext } from '../contexts/ThemeContext'

const mapStateToProps = (state) => {
  return {
    userFullInfo: state.cloud.userFullInfo,
  };
};

const getTheme = (mode) => {
  return  mode ? "dark" : "light";
};

const ThemeProvider = ({ children, userFullInfo }) => {
  const [ theme, setTheme ] = React.useState(getTheme(userFullInfo.is_dark));

  React.useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [ theme ])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default connect(mapStateToProps, null)(ThemeProvider);