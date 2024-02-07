import React from 'react'
import { CgChevronRight } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import { logout} from '../utils/api';

const WebMenu = (
  {setMenuOpen,
  isChecked,
  toggleCheckbox,
  toggleMenu,
  setDropDownShown}) => {
  return (
    <div className="menu">
    <Link className="menu-item"
      to="/analysis/account_settings"
      onClick={() => {
        setMenuOpen(false);
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      Account Settings
    </Link>
    <div className="menu-item form-check form-switch w-100">
      <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Best move arrow</label>
      <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked={isChecked} onChange={toggleCheckbox} />
    </div>
    <span>
      <button className='menu-item' value="BOARD_THEME" onClick={(e) => {
        toggleMenu(e);
        setDropDownShown(e.currentTarget.value)
      }}
      >
        Board Theme
        <CgChevronRight />
      </button>
    </span>

    <span>
      <button className='menu-item' value="PIECE_SET" onClick={(e) => {
        toggleMenu(e);
        setDropDownShown(e.currentTarget.value)
      }} >
        Piece Set
        <CgChevronRight />
      </button>
    </span>


    <a className="menu-item" href="/contact" target="_blank" rel="noopener noreferrer">Help Center</a>
    <button className="change-btn" onClick={logout}>
      Log out
    </button>
  </div>
  )
}

export default WebMenu
