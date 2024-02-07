import React, { useState, useEffect } from 'react';
import { CgChevronLeft } from 'react-icons/cg';
import { getUserAccount } from '../../actions/cloud';
import { connect } from 'react-redux';
import { setDashboardSettings } from '../../utils/api';
const mapStateToProps = (state) => {
    return {
        userInfo: state.cloud.userInfo,
    };
};
const DropDownList = ({ label, data, userInfo, toggleMenu, isShowTitle, setStylePath, getUserAccount }) => {
    const [active, setActive] = useState(null)
    const handleDropDownItem = (e, item) => {
        setActive(item);
        if (label == "Board Theme") {
            setDashboardSettings(userInfo.token, userInfo.is_dark, userInfo.arrows_enabled, e.target.value, userInfo.pieces_theme)
                .then((response) => {
                    if (response) {
                        if (userInfo.username === response.user.username) {
                            delete response.user
                        }
                        getUserAccount({ ...userInfo, ...response })
                    }
                })
        } else {
            setDashboardSettings(userInfo.token, userInfo.is_dark, userInfo.arrows_enabled, userInfo.board_theme, e.target.value)
                .then((response) => {
                    if (response) {
                        if (userInfo.username === response.user.username) {
                            delete response.user
                        }
                        getUserAccount({ ...userInfo, ...response })
                    }
                })
            setStylePath(`https://lichess1.org/assets/_TDotAa/piece-css/${item.name}.css`)
        }
    }

    return (
        <div className={isShowTitle ? "dropDownList" : 'mobile-dropDownList'} >
            {isShowTitle ? (<div className='dropMenu-back '>
                <button className='dropdown-btn' onClick={(e) => {
                    toggleMenu(e)
                }}>
                    <CgChevronLeft />
                    <span>{label}</span>
                </button>

            </div>)
                : null
            }
            <>
                {
                    data.map(item => {
                        return <button
                            onClick={(e) => handleDropDownItem(e, item)}
                            key={item.id} className={`dropDown-item ${active == item && 'active'}`}
                            value={item.name} title={item.name}
                            style={{ backgroundImage: `url(${item.src})` }}></button>
                    })

                }
            </>
        </div >
    )
}

export default connect(mapStateToProps, { getUserAccount })(DropDownList);