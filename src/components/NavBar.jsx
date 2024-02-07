import React, { useEffect, useState } from 'react';
import {
  CgMenu,
  CgClose,
  CgChevronDown,
  CgArrowDown,
  CgProfile,
  CgArrowUp,
} from 'react-icons/cg';
import { FiShoppingBag } from 'react-icons/fi';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getStatistics } from '../actions/userAccount';
import {
  setFen,
  setBoardOrientation,
  setPgn,
  setEditMode,
} from '../actions/board';
import { setDashboardSettings } from '../utils/api';
import { switchToBoard } from '../utils/utils';
import { BOARD_THEME, PIECE_SET } from '../constants/board-params';
import YoutubeTutorials from './YoutubeTutorials';
import DropDownList from './ui/DropDownList';
import Portal from './ui/Portal';
import WebMenu from './WebMenu';
import MobileMenu from './MobileMenu';
import RootToggle from './Root';
import { getUserAccount } from '../actions/cloud';

const mapStateToProps = (state) => {
  return {
    usageInfo: state.userAccount.usageInfo,
    isEditMode: state.board.isEditMode,
    fen: state.board.fen,
    userInfo: state.cloud.userInfo,
    plans: state.cloud.plans,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const NavBar = ({
  userInfo,
  usageInfo,
  isEditMode,
  getStatistics,
  setEditMode,
  fen,
  setPgn,
  setFen,
  setBoardOrientation,
  getUserAccount,
  plans,
  isGuestUser,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClickMenu, setIsClickMenu] = useState(false);
  const [stylePath, setStylePath] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [dropDownShown, setDropDownShown] = useState('');
  const openCloseMenu = isMobileMenuOpen ? (
    <CgClose className="menu-icon" />
  ) : (
    <CgMenu className="menu-icon" />
  );
  const [hideNavBar, setHideNavBar] = useState(false);

  const handleUserAccountMouseOver = () => {
    const isEditComplete = window.confirm('Did you finish editing?');
    if (isEditComplete) {
      switchToBoard(
        setFen,
        setBoardOrientation,
        setEditMode,
        isEditMode,
        setPgn,
        fen
      );
    }
  };
  const toggleMenu = (e) => {
    e.preventDefault();
    setMenuOpen(!isMenuOpen);
    if (dropDownShown) setDropDownShown();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (userInfo) setIsChecked(userInfo.arrows_enabled);
  };

  const toggleCheckbox = () => {
    setDashboardSettings(
      userInfo.token,
      userInfo.is_dark,
      !isChecked,
      userInfo.board_theme,
      userInfo.pieces_theme
    ).then((response) => {
      if (response) {
        if (userInfo.username === response.user.username) {
          delete response.user;
        }
        getUserAccount({ ...userInfo, ...response });
      }
    });
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    if (isClickMenu) {
      setMenuOpen(true);
    }
  }, [isClickMenu]);

  useEffect(() => {
    var head = document.head;
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = stylePath;
    link.id = 'piece-sprite';
    head.appendChild(link);
    return () => {
      head.removeChild(link);
    };
  }, [stylePath]);

  useEffect(() => {
    if (isGuestUser) return;
    const flagUserAccount = document.getElementById('user-account');
    const flagUserAccountMB = document.getElementById('user-account-mobile');
    if (isEditMode && !hideNavBar) {
      flagUserAccount.addEventListener('click', handleUserAccountMouseOver);
      flagUserAccountMB.addEventListener('click', handleUserAccountMouseOver);
    }
    fetch('/user_account/get_statistics')
      .then((response) => response.json())
      .then((data) => getStatistics(data.usage_info));

    const intervalId = setInterval(() => {
      fetch('/user_account/get_statistics')
        .then((response) => response.json())
        .then((data) => getStatistics(data.usage_info));
    }, 60000);
    return () => {
      clearInterval(intervalId);
      if (!hideNavBar && !isGuestUser) {
        flagUserAccount.removeEventListener(
          'click',
          handleUserAccountMouseOver
        );
        flagUserAccountMB.removeEventListener(
          'click',
          handleUserAccountMouseOver
        );
      }
    };
  }, [isEditMode]);

  const info = usageInfo[0];
  return (
    <>
      {!hideNavBar ? (
        <nav className="nav-header">
          <div className="nav-header-content">
            <div className="nav-header-body">
              <div className="nav-header-img">
                <a href="/">
                  <img
                    src={require('../../public/assets/images/chessify_logo_grey.svg')}
                    alt="Chessify"
                  />
                </a>
              </div>
              <div className="statistic">
                {!isGuestUser ? (
                  <span className="nav-header-body_info">
                    Today:
                    <span className="nav-header-body_today">
                      {info && ' ' + info.minutes + 'min'}
                    </span>
                    <span style={{ margin: '0 4px', color: '#358C65' }}>
                      {info && info.increase ? <CgArrowUp /> : <CgArrowDown />}
                      {info && info.diff + '%'}
                    </span>
                  </span>
                ) : (
                  <></>
                )}

                <YoutubeTutorials />
              </div>
            </div>
            <div className="nav-header-info">
              {!isGuestUser ? (
                <span className="coins">
                  Coins: <p>{plans ? plans.balance : ''}</p>
                  <a href="/pricing" className="buy-btn">
                    <FiShoppingBag />
                    Buy
                  </a>
                </span>
              ) : (
                <></>
              )}
              {!isGuestUser ? (
                <>
                  <span className="user-name" id="user-account">
                    <button
                      className="chevron-down"
                      onClick={(e) => {
                        setIsClickMenu(!isClickMenu);
                        setIsChecked(userInfo.arrows_enabled);
                      }}
                      style={{ pointerEvents: isEditMode ? 'none' : '' }}
                    >
                      <CgProfile className="profile-img" />
                      {userInfo && userInfo.username}{' '}
                      <CgChevronDown className="chevron-down-icon" />
                    </button>
                    {isClickMenu ? (
                      <Portal>
                        {isMenuOpen ? (
                          <WebMenu
                            setMenuOpen={setMenuOpen}
                            isChecked={isChecked}
                            toggleCheckbox={toggleCheckbox}
                            toggleMenu={toggleMenu}
                            setDropDownShown={setDropDownShown}
                          />
                        ) : (
                          dropDownShown && (
                            <DropDownList
                              data={
                                dropDownShown == 'BOARD_THEME'
                                  ? BOARD_THEME
                                  : PIECE_SET
                              }
                              toggleMenu={toggleMenu}
                              label={
                                dropDownShown == 'BOARD_THEME'
                                  ? 'Board Theme'
                                  : 'Piece Set'
                              }
                              isShowTitle={true}
                              setStylePath={setStylePath}
                            />
                          )
                        )}
                      </Portal>
                    ) : null}
                  </span>
                  <div className="user-profile-img" id="user-account-mobile">
                    <Link
                      to="/analysis/account_settings"
                      style={{ pointerEvents: isEditMode ? 'none' : '' }}
                    >
                      <CgProfile className="profile-img" />
                    </Link>
                    <i
                      onClick={toggleMobileMenu}
                      style={{ pointerEvents: isEditMode ? 'none' : '' }}
                    >
                      {openCloseMenu}
                    </i>
                  </div>
                  <div className="light-dark-switch">
                    <RootToggle />
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="game-format-btn game-format-close-btn sign-in-btn"
                    onClick={() => {
                      window.location.href = '/auth/signin';
                    }}
                  >
                    <CgProfile className="profile-img" />
                    Sign In
                  </button>
                </>
              )}
              <button
                className="close-nav-btn"
                type="button"
                onClick={() => {
                  setHideNavBar(true);
                }}
              >
                <img
                  src={require('../../public/assets/images/double-arrow-down.svg')}
                  width="14"
                  height="14"
                  alt=""
                />
              </button>
            </div>
          </div>
        </nav>
      ) : (
        <nav className="nav-header-hidden">
          <button
            className="open-nav-btn"
            type="button"
            onClick={() => {
              setHideNavBar(false);
            }}
          >
            <img
              src={require('../../public/assets/images/double-arrow-down.svg')}
              width="14"
              height="14"
              alt=""
            />
          </button>
        </nav>
      )}
      {isMobileMenuOpen && (
        <MobileMenu
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isChecked={isChecked}
          toggleCheckbox={toggleCheckbox}
          setStylePath={setStylePath}
        />
      )}
    </>
  );
};

export default connect(mapStateToProps, {
  getStatistics,
  setEditMode,
  setFen,
  setBoardOrientation,
  setPgn,
  getUserAccount,
})(NavBar);
