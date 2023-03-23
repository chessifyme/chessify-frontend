import React from 'react';
import { connect } from 'react-redux';
import { ThemeContext, themes } from '../../contexts/ThemeContext';
import { setColorMode } from '../../../src/utils/api';
import Toggle from '../Toggle';

const mapStateToProps = (state) => {
  return {
    userFullInfo: state.cloud.userFullInfo,
  };
};

const RootToggle = ({ userFullInfo }) => (
  <ThemeContext.Consumer>
    {({ theme, setTheme }) => (
      <Toggle
        onChange={() => {
          if (theme === themes.light) {
            setColorMode(userFullInfo.token, userFullInfo.userProfileId, true);
            setTheme(themes.dark);
          }
          if (theme === themes.dark) {
            setColorMode(userFullInfo.token, userFullInfo.userProfileId, false);
            setTheme(themes.light);
          }
        }}
        value={theme === themes.dark}
      />
    )}
  </ThemeContext.Consumer>
);
export default connect(mapStateToProps, null)(RootToggle);