import React, { useEffect, useState } from 'react';
import {
  CgMenu,
  CgClose,
  CgChevronDown,
  CgArrowDown,
  CgProfile,
  CgChevronRight,
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
import { logout } from '../utils/api';
import { switchToBoard } from '../utils/utils';
import RootToggle from './Root';
import YoutubeTutorials from './YoutubeTutorials';

const mapStateToProps = (state) => {
  return {
    usageInfo: state.userAccount.usageInfo,
    isEditMode: state.board.isEditMode,
    fen: state.board.fen,
  };
};

const NavBar = ({
  userInfo,
  getStatistics,
  usageInfo,
  isEditMode,
  setEditMode,
  fen,
  setPgn,
  setFen,
  setBoardOrientation,
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
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
      if (!hideNavBar) {
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
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (hideNavBar) {
    return (
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
    );
  }

  return (
    <>
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
              <YoutubeTutorials />
            </div>
          </div>
          <div className="nav-header-info">
            <span className="coins">
              Coins: <p>{userInfo.balance}</p>
              <a href="/pricing" className="buy-btn">
                <FiShoppingBag />
                Buy
              </a>
            </span>
            <span className="user-name" id="user-account">
              <Link
                to="/analysis/account_settings"
                style={{
                  pointerEvents: isEditMode ? 'none' : '',
                  cursor: 'pointer',
                }}
              >
                <CgProfile className="profile-img" />
                {userInfo.username}
              </Link>
              <button
                className="chevron-down"
                onClick={toggleMenu}
                style={{ pointerEvents: isEditMode ? 'none' : '' }}
              >
                <CgChevronDown className="chevron-down-icon" />
              </button>
              {isMenuOpen && (
                <div className="menu-div">
                  <div className="menu">
                    <Link
                      to="/analysis/account_settings"
                      onClick={() => {
                        setMenuOpen(false);
                      }}
                    >
                      Account Settings
                    </Link>
                    <a href="/contact">Help Center</a>
                    <button className="change-btn" onClick={logout}>
                      Log out
                    </button>
                  </div>
                </div>
              )}
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
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {/* <div className="link_div">
            <Link
              to="/statistics"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Statistics
            </Link>
            <CgChevronRight />
          </div> */}
          <div className="link_div">
            <Link
              to="/analysis/account_settings"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Account Settings
            </Link>
            <CgChevronRight />
          </div>
          <div className="link_div">
            <a href="https://chessify.me/contact">Help Center</a>
            <CgChevronRight />
          </div>
          <div className="menu_buttons">
            <Link
              to="/analysis"
              className="green-btn"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              Go to Dashboard
            </Link>
            <button className="change-btn" onClick={logout}>
              Log out
            </button>
            <div>
              <RootToggle />
            </div>
          </div>
        </div>
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
})(NavBar);
