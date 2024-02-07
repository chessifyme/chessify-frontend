import React from 'react';
import { connect } from 'react-redux';
import { ThemeContext, themes } from '../../contexts/ThemeContext';
import { setDashboardSettings } from '../../../src/utils/api';
import { getUserAccount } from '../../actions/cloud';
import Toggle from '../Toggle';

const mapStateToProps = (state) => {
  return {
    userInfo: state.cloud.userInfo,
  };
};

const RootToggle = ({ userInfo, getUserAccount }) => (

  <ThemeContext.Consumer>
    {({ theme, setTheme }) => (
      <Toggle
        onChange={() => {
          if (theme === themes.light) {
            setDashboardSettings(userInfo.token, true, userInfo.arrows_enabled, userInfo.board_theme, userInfo.pieces_theme)
              .then((response) => {
                if (response) {
                  if (userInfo.username === response.user.username) {
                      delete response.user
                  }
                  getUserAccount({ ...userInfo, ...response })
              }
              });
            setTheme(themes.dark);
          }
          if (theme === themes.dark) {
            setDashboardSettings(userInfo.token, false, userInfo.arrows_enabled, userInfo.board_theme, userInfo.pieces_theme)
              .then((response) => {
                if (response) {
                  if (userInfo.username === response.user.username) {
                      delete response.user
                  }
                  getUserAccount({ ...userInfo, ...response })
              }
              })
            setTheme(themes.light);
          }
        }}
        value={theme === themes.dark}
      />
    )}
  </ThemeContext.Consumer>
);
export default connect(mapStateToProps, { getUserAccount })(RootToggle);