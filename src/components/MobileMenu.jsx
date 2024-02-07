import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import { BOARD_THEME, PIECE_SET } from '../constants/board-params';
import { logout} from '../utils/api';
import { CgChevronRight } from 'react-icons/cg'
import DropDownList from './ui/DropDownList';
import RootToggle from './Root';


const MobileMenu = (
    {setIsMobileMenuOpen,
     isChecked,
     toggleCheckbox,
     setStylePath,
    }) => {
    const [accardion, setAccardion] = useState("")

  return (
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

    <Link className="mobile-menu-item"
      to="/analysis/account_settings"
      onClick={() => {
        setIsMobileMenuOpen(false);
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      Account Settings
      <CgChevronRight />
    </Link>

    <div className="mobile-menu-item form-check form-switch">
      <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Best move arrow</label>
      <input className="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked={isChecked} onChange={toggleCheckbox} />
    </div>
    <button className="mobile-menu-item" value="BOARD_THEME" onClick={(e) => {
      !accardion ? setAccardion(e.currentTarget.value) : setAccardion()
    }}
    >
      Board Theme
      <CgChevronRight />
    </button>
    {accardion == "BOARD_THEME" && <DropDownList data={BOARD_THEME} isShowTitle={false} label={"Board Theme"} />}

    <button className='mobile-menu-item' value="PIECE_SET" onClick={(e) => {
      !accardion ? setAccardion(e.currentTarget.value) : setAccardion()

    }} >
      Piece Set
      <CgChevronRight />
    </button>
    {accardion == "PIECE_SET" && <DropDownList data={PIECE_SET} isShowTitle={false} setStylePath={setStylePath} />}
    <a className="mobile-menu-item" href="/contact" target="_blank" rel="noopener noreferrer">Help Center    <CgChevronRight /></a>

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
  )
}

export default MobileMenu
