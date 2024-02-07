import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {
  setActiveFile,
  setActiveMove,
  setActivePgnTab,
  removePgnFromArr,
  changeTabName,
  addPgnToArr,
  setAnalyzingFenTabIndx,
  setNavigationGamesInfo,
  setPgn,
  setUserUploads,
} from '../../actions/board';
import {
  RiCloseFill,
  RiAddFill,
  RiArrowLeftLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { GoGear } from 'react-icons/go';
import { INITIAL_PGN_STRING } from '../../constants/board-params';
import { getFiles, stopServer } from '../../utils/api';
import UploadsSavingModal from './UploadsSavingModal';
import SaveNextGameModal from './SaveNextGameModal';
import {
  setComputedData,
  setFullAnalysisOn,
  setFullGameFenArr,
  setInitiateFullAnalysis,
  getUserServersInfo,
} from '../../actions/cloud';
import {
  addScoreToPgnStr,
  fixPgnStrCommentPosition,
  generateNewFolderName,
} from '../../utils/pgn-viewer';
import SavePgnUploadModal from './SavePgnUploadModal';

const mapStateToProps = (state) => {
  return {
    pgnStr: state.board.pgnStr,
    userInfo: state.cloud.userInfo,
    loader: state.board.loader,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    fullAnalysisOn: state.cloud.fullAnalysisOn,
    proAnalyzers: state.cloud.proAnalyzers,
    navigationGameIndx: state.board.navigationGameIndx,
    navigationGames: state.board.navigationGames,
    searchParams: state.board.searchParams,
    navigationPages: state.board.navigationPages,
    userUploads: state.board.userUploads,
    navigationGamesTabs: state.board.navigationGamesTabs,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const MultiTabNotation = (props) => {
  const {
    pgnStr,
    userInfo,
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
    fullAnalysisOn,
    setComputedData,
    setFullAnalysisOn,
    setFullGameFenArr,
    setAnalyzingFenTabIndx,
    setInitiateFullAnalysis,
    toggleSymbolChange,
    symbolMode,
    setNavigationGamesInfo,
    navigationGames,
    navigationGameIndx,
    setPgn,
    searchParams,
    navigationPages,
    userUploads,
    setUserUploads,
    navigationGamesTabs,
    isGuestUser,
    getUserServersInfo
  } = props;

  const [editTabNameIndx, setEditTabNameIndx] = useState(-1);
  const [newTabName, setNewTabName] = useState('');
  const [openSaveWarning, setOpenSaveWarning] = useState(false);
  const [fileCloseLoader, setFileCloseLoader] = useState(-1);
  const [closeFileTabIndx, setCloseFileTabInx] = useState(-1);
  const refInput = useRef(null);
  const [showGearIndx, setShowGearIndx] = useState(null);
  const [openSaveModal, setOpenSaveModal] = useState(false);
  const [saveIndent, setSaveIndent] = useState();
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadPgnModal, setUploadPgnModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const uploadPgnCloudHandler = () => {
    if (
      userUploads &&
      Object.keys(userUploads).length === 0 &&
      !userUploads.hasOwnProperty('noExistingFilesErrorMessage')
    ) {
      setIsLoading(true);
      setUserUploads('/', userInfo).then(({ payload }) => {
        setUploadPgnModal(true);
        setIsLoading(false);
        setNewFolderName(
          generateNewFolderName(payload.userUploads, 'New Folder')
        );
      });
    } else {
      setUploadPgnModal(true);
      setNewFolderName(generateNewFolderName(userUploads, 'New Folder'));
    }
  };

  useEffect(() => {
    if (analyzingFenTabIndx || analyzingFenTabIndx === 0) {
      setShowGearIndx(analyzingFenTabIndx);
    } else {
      setShowGearIndx(null);
    }
  }, [analyzingFenTabIndx]);

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

  const setNewActiveTab = (indx) => {
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
  };

  const handleStopServer = (serverName, indx, isActive) => {
    stopServer(serverName)
      .then((response) => {
        if (response.error) {
          if(response.servers)
          getUserServersInfo({servers:response.servers})
          console.log('ERROR STOPPING');
          return;
        } else {
          setInitiateFullAnalysis(false);
          setFullAnalysisOn(false);
          setFullGameFenArr([]);
          setComputedData([]);
          setAnalyzingFenTabIndx(null);
          removePgnFromArr(indx);
          if (isActive) setNewActiveTab(indx);
          getUserServersInfo({servers:response.servers})
          console.log('Success stoped');
        }
      })
      .catch((e) => {
        console.error('IN CATCH', e);
      });
  };

  const closeTabHelper = (indx) => {
    const isAnalyzingTab = indx === analyzingFenTabIndx;

    if (activePgnTab === indx) {
      if (fullAnalysisOn) {
        handleStopServer('stockfish10', indx, true);
        return;
      }
      removePgnFromArr(indx);
      setNewActiveTab(indx);
    } else if (isAnalyzingTab) {
      if (!fullAnalysisOn) {
        let newTab = activePgnTab + (activePgnTab > indx ? -1 : 0);
        handleAnalyze(newTab);
        removePgnFromArr(indx);
      } else {
        handleStopServer('stockfish10', indx, false);
        return;
      }
    } else {
      removePgnFromArr(indx);
      setNewActiveTab(activePgnTab);
    }
  };

  const closeTabHandler = (indx) => {
    if (
      allPgnArr[indx] &&
      allPgnArr[indx].tabFile &&
      allPgnArr[indx].tabFile.key
    ) {
      const tab = allPgnArr[indx];
      let currentPgnStr = tab.tabPgnStr;
      if (activePgnTab === indx) {
        currentPgnStr = pgnStr;
      }
      setFileCloseLoader(indx);
      getFiles(tab.tabFile.id, tab.tabFile.path, userInfo.token)
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

  const changeRefIndx = (indent) => {
    const navIndx = navigationGameIndx - navigationPages[0] * 10;

    const noPrev = indent === -1 && navigationGameIndx <= 0;
    const noNext =
      indent === 1 &&
      navigationGames.games &&
      navIndx === navigationGames.games.length - 1;
    if (noPrev || noNext) {
      return;
    }
    setNavigationGamesInfo(indent, false);
  };

  const changeRefIndxHandler = (indent) => {
    setButtonDisabled(true);
    let nextGamesStorage = JSON.parse(
      sessionStorage.getItem('chessify_next_games')
    );
    if (nextGamesStorage && nextGamesStorage.length) {
      let exictingIndex = nextGamesStorage.findIndex(
        (elem) => elem.activeTab === activePgnTab
      );
      if (
        exictingIndex > -1 &&
        nextGamesStorage[exictingIndex].game &&
        !isGuestUser
      ) {
        let storageGame = nextGamesStorage[exictingIndex].game.pgn;
        storageGame = storageGame.trim();
        storageGame = addScoreToPgnStr(storageGame);
        storageGame = fixPgnStrCommentPosition(storageGame);
        if (pgnStr !== storageGame) {
          setSaveIndent(indent);
          setOpenSaveModal(true);
          return;
        }
      }
    }

    if (
      pgnStr !== ' *' &&
      pgnStr.length &&
      !navigationGamesTabs.includes(activePgnTab)
    ) {
      addPgnToArr(' *', {});
    }
    changeRefIndx(indent);
    setTimeout(() => {
      setButtonDisabled(false);
    }, 100);
  };

  useEffect(() => {
    if (
      (searchParams.whitePlayer && searchParams.whitePlayer.length) ||
      (searchParams.blackPlayer && searchParams.blackPlayer.length)
    ) {
      setNavigationGamesInfo(0, true);
    }
  }, [
    searchParams.whitePlayer ? searchParams.whitePlayer : null,
    searchParams.balckPlayer ? searchParams.blackPlayer : null,
  ]);

  return (
    <React.Fragment>
      <div className="multi-tab-line mt-1">
        {allPgnArr.map((tab, indx) => {
          return (
            <div
              className={`single-tab ${
                activePgnTab === indx ? 'active-tab' : ''
              }`}
              key={indx}
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
              {showGearIndx === indx ? (
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
        <div className="pgn-regulation">
          <div className="ref-controls">
            <RiArrowLeftLine
              className={`control ${
                navigationGameIndx <= 0 ? 'inactive-control' : ''
              }`}
              title={'Previous Game'}
              onClick={() => {
                changeRefIndxHandler(-1);
              }}
              disabled={buttonDisabled}
            />
            <img
              src={require('../../../public/assets/images/pgn-viewer/reference-inactive.svg')}
              height={20}
              width={20}
              alt=""
            />
            <RiArrowRightLine
              className={`control ${
                navigationGames &&
                navigationGames.games &&
                navigationGameIndx - navigationPages[0] * 10 ===
                  navigationGames.games.length - 1
                  ? 'inactive-control'
                  : ''
              }`}
              title={'Next Game'}
              onClick={() => {
                changeRefIndxHandler(1);
              }}
              disabled={buttonDisabled}
            />
          </div>
          <div className="toggle-btn">
            <p className="letter-toggle">N</p>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    onChange={toggleSymbolChange}
                    checked={symbolMode === 'symbol' ? true : false}
                    value="active"
                    size="small"
                  />
                }
                label=""
              />
            </FormGroup>
            <p>
              <span>{'\u265E'}</span>
            </p>
          </div>
        </div>
      </div>

      <UploadsSavingModal
        isOpen={openSaveWarning}
        setIsOpen={setOpenSaveWarning}
        closeFileTabInx={closeFileTabIndx}
        setCloseFileTabInx={setCloseFileTabInx}
        closeTab={closeTabHelper}
      />
      <SaveNextGameModal
        isOpen={openSaveModal}
        setIsOpen={setOpenSaveModal}
        changeRefIndx={changeRefIndx}
        saveIndent={saveIndent}
        uploadPgnCloudHandler={uploadPgnCloudHandler}
        isLoading={isLoading}
      />
      <SavePgnUploadModal
        isOpen={uploadPgnModal}
        setIsOpen={setUploadPgnModal}
        setNewFolderName={setNewFolderName}
        newFolderName={newFolderName}
        saveIndent={saveIndent}
        changeRefIndx={changeRefIndx}
        goToNextGame={true}
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
  setComputedData,
  setFullAnalysisOn,
  setFullGameFenArr,
  setNavigationGamesInfo,
  setInitiateFullAnalysis,
  setPgn,
  setUserUploads,
  getUserServersInfo
})(MultiTabNotation);
