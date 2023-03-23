import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  setActiveFile,
  setActiveMove,
  setActivePgnTab,
  removePgnFromArr,
  changeTabName,
  addPgnToArr,
  setAnalyzingFenTabIndx,
} from '../../actions/board';
import { RiCloseFill, RiAddFill } from 'react-icons/ri';
import { GoGear } from 'react-icons/go';
import { INITIAL_PGN_STRING } from '../../constants/board-params';
import { getFiles } from '../../utils/api';
import UploadsSavingModal from './UploadsSavingModal';
import { modifyAllPgnArr } from '../../utils/pgn-viewer';

const mapStateToProps = (state) => {
  return {
    pgnStr: state.board.pgnStr,
    userFullInfo: state.cloud.userFullInfo,
    fen: state.board.fen,
    loader: state.board.loader,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    activeMove: state.board.activeMove,
  };
};

const MultiTabNotation = (props) => {
  const {
    pgnStr,
    userFullInfo,
    handleAnalyze,
    setActiveFile,
    allPgnArr,
    setActiveMove,
    setActivePgnTab,
    removePgnFromArr,
    changeTabName,
    addPgnToArr,
    activePgnTab,
    analyzingFenTabIndx,
    activeMove,
  } = props;

  const [editTabNameIndx, setEditTabNameIndx] = useState(-1);
  const [newTabName, setNewTabName] = useState('');
  const [openSaveWarning, setOpenSaveWarning] = useState(false);
  const [fileCloseLoader, setFileCloseLoader] = useState(-1);
  const [closeFileTabIndx, setCloseFileTabInx] = useState(-1);
  const refInput = useRef(null);

  useEffect(() => {
    window.onbeforeunload = function () {
      setActiveMove(activeMove);
      setActivePgnTab(activePgnTab);
      modifyAllPgnArr(allPgnArr);
      window.sessionStorage.setItem(
        'chessify_active_notation_tab',
        activePgnTab
      );
      window.sessionStorage.setItem(
        'chessify_analysis_notation_tab',
        analyzingFenTabIndx
      );
      window.sessionStorage.setItem(
        'chessify_notation_tab_arr',
        JSON.stringify(allPgnArr)
      );
      return;
    };

    return () => {
      window.onbeforeunload = null;
    };
  }, [activePgnTab, analyzingFenTabIndx, allPgnArr, activeMove]);

  const handleClickOutside = (event) => {
    if (refInput.current && !refInput.current.contains(event.target)) {
      if (newTabName.length) {
        changeTabName(newTabName, editTabNameIndx);
        setNewTabName('');
      }
      setEditTabNameIndx(-1);
    }
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 500);

    return () => {
      clearTimeout(identifier);
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  const setActivePgnTabHandler = (e, tab, indx) => {
    if (activePgnTab !== indx) {
      setActivePgnTab(indx);
      setActiveMove(tab.tabActiveMove);
    }

    if (tab.tabFile && tab.tabFile.key) {
      const path = tab.tabFile.key.split('/')[1];
      setActiveFile(tab.tabPgnStr, tab.tabFile, path);
    }

    if (e.detail === 1 && editTabNameIndx > -1 && indx !== editTabNameIndx)
      setEditTabNameIndx(-1);

    if (e.detail >= 2) {
      setEditTabNameIndx(indx);
      setNewTabName(
        tab.tabName + (tab.tabName === 'Notation' ? ` ${indx + 1}` : '')
      );
    }
  };

  const closeTabHelper = (indx) => {
    removePgnFromArr(indx);
    const isAnalyzingTab = indx === analyzingFenTabIndx;

    if (activePgnTab === indx) {
      let newTab = allPgnArr[indx - 1] ? indx - 1 : indx;

      setActiveMove(allPgnArr[newTab].tabActiveMove);
      if (allPgnArr[newTab].tabFile && allPgnArr[newTab].tabFile.key) {
        const path = allPgnArr[newTab].tabFile.key.split('/')[1];
        setActiveFile(
          allPgnArr[newTab].tabPgnStr,
          allPgnArr[newTab].tabFile,
          path
        );
      } else {
        setActiveFile('', {}, '');
      }
    } else if (isAnalyzingTab) {
      let newTab = activePgnTab + (activePgnTab > indx ? -1 : 0);
      handleAnalyze(newTab);
    }
  };

  const closeTabHandler = (indx) => {
    if (allPgnArr[indx].tabFile && allPgnArr[indx].tabFile.key) {
      const tab = allPgnArr[indx];
      let currentPgnStr = tab.tabPgnStr;
      if (activePgnTab === indx) {
        currentPgnStr = pgnStr;
      }
      setFileCloseLoader(indx);
      getFiles(tab.tabFile.id, tab.tabFile.path, userFullInfo.token)
        .then((fileContent) => {
          if (!fileContent.includes(currentPgnStr)) {
            setOpenSaveWarning(true);
            setCloseFileTabInx(indx);
          }
          setFileCloseLoader(-1);
          return fileContent;
        })
        .then((fileContent) => {
          if (fileContent.includes(currentPgnStr)) {
            closeTabHelper(indx);
            setFileCloseLoader(-1);
          }
        });
    } else {
      closeTabHelper(indx);
    }
  };

  return (
    <React.Fragment>
      <div className="multi-tab-line">
        {allPgnArr.map((tab, indx) => {
          return (
            <div
              className={`single-tab ${
                activePgnTab === indx ? 'active-tab' : ''
              }`}
            >
              <div
                title="Double click to change the name"
                onClick={(e) => {
                  setActivePgnTabHandler(e, tab, indx);
                }}
              >
                {editTabNameIndx === indx ? (
                  <input
                    value={newTabName}
                    ref={refInput}
                    onChange={(e) => {
                      setNewTabName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        changeTabName(newTabName, indx);
                        setNewTabName('');
                        setEditTabNameIndx(-1);
                      }
                    }}
                  />
                ) : (
                  tab.tabName +
                  (tab.tabName === 'Notation' ? ` ${indx + 1}` : '')
                )}
              </div>
              {analyzingFenTabIndx === indx ? (
                <GoGear className="engine-running" />
              ) : (
                <></>
              )}
              <button
                className="tab-btn"
                onClick={() => {
                  closeTabHandler(indx);
                }}
                disabled={allPgnArr.length === 1}
              >
                {fileCloseLoader === indx ? (
                  <div className="circle-loader"></div>
                ) : (
                  <RiCloseFill />
                )}
              </button>
            </div>
          );
        })}
        <div className="tab-add-btn">
          <button
            className="tab-btn"
            onClick={() => {
              addPgnToArr(INITIAL_PGN_STRING, {});
            }}
          >
            <RiAddFill />
          </button>
        </div>
      </div>

      <UploadsSavingModal
        isOpen={openSaveWarning}
        setIsOpen={setOpenSaveWarning}
        closeFileTabInx={closeFileTabIndx}
        setCloseFileTabInx={setCloseFileTabInx}
        closeTab={closeTabHelper}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  setActiveFile,
  setActiveMove,
  setActivePgnTab,
  removePgnFromArr,
  changeTabName,
  addPgnToArr,
  setAnalyzingFenTabIndx,
})(MultiTabNotation);
