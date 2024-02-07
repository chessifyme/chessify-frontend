import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import Variations from './Variations';
import VariationActions from './VariationActions';
import Toolbar from './Toolbar';
import DesktopEnginesList from './DesktopEnginesList';
import MoveReference from './MoveReference';
import BoardReference from './BoardReference';
import VariationOptionsModal from './VariationOptionsModal';
import { IoMdFolder } from 'react-icons/io';
import { FaVideo, FaRegFilePdf } from 'react-icons/fa';
import { RiFile3Fill } from 'react-icons/ri';
import { GoGraph } from 'react-icons/go';
import { GiChessKing } from 'react-icons/gi';
import { SlGraph } from 'react-icons/sl';
import { connect } from 'react-redux';
import Uploads from './Uploads';
import MoveContextmenu from './MoveContextmenu';
import AnalysisArea from './AnalysisArea';
import VideosArea from './VideosArea';
import UploadsLimitModal from './UploadsLimitModal';
import { SOCKET_URL } from '../../constants/cloud-params';
import { filterAlphanumeric } from '../../utils/utils';

import {
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setUserUploads,
  setTourNextStep,
  setAnalyzingFenTabIndx,
  promoteVariation,
  setLichessDB,
  setNavigationGamesInfo,
  setPgn,
} from '../../actions/board';
import { connectToPro, getUserServersInfo, setSubModal } from '../../actions/cloud';
import { getUserServersData } from '../../utils/api'
import ActiveVarOptionsModal from './ActiveVarOptionsModal';
import CreateNewFolderModal from './CreateNewFolderModal';
import Onboarding from './Onboarding';
import OnboardingTutorial from './OnboardingTutorial';
import MultiTabNotations from './MultiTabNotations';
import PdfScanner from './PdfScanner';
import LichessDatabase from './LichessDatabase';
import DecodeChess from '../common/DecodeChess';
import FullGameAnalysis from './FullGameAnalysis';
import useKeyPress from './KeyPress';
import ChessAIBuddy from './ChessAIBuddy';
import { findLinkTabIndex, getLinkFromIndex } from '../../utils/pgn-viewer';


const mapStateToProps = (state) => {
  return {
    variationOpt: state.board.variationOpt,
    activeFileInfo: state.board.activeFileInfo,
    pgnStr: state.board.pgnStr,
    pgn: state.board.pgn,
    searchParams: state.board.searchParams,
    fen: state.board.fen,
    uploadFilterByPos: state.board.uploadFilterByPos,
    loader: state.board.loader,
    tourType: state.board.tourType,
    tourStepNumber: state.board.tourStepNumber,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    activeMove: state.board.activeMove,
    userInfo: state.cloud.userInfo,
    searchParamsLichess: state.board.searchParamsLichess,
    searchParamsLichessPlayer: state.board.searchParamsLichessPlayer,
    plans: state.cloud.plans,
    navigationGameIndx: state.board.navigationGameIndx,
    navigationGames: state.board.navigationGames,
    navigationGamesTabs: state.board.navigationGamesTabs,
    navigationPages: state.board.navigationPages,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const SYMBOL_MODE_LS_OPTION = 'dashboard:symbolMode';
const ACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-active.svg');
const INACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-inactive.svg');
const ACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-active.svg');
const INACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-inactive.svg');

const DesktopPGNViewer = (props) => {
  const {
    variationOpt,
    activeFileInfo,
    pgnStr,
    fen,
    handleAnalyze,
    fenToAnalyze,
    setFenToAnalyze,
    uploadFiles,
    setCurrentDirectory,
    setActiveTab,
    activeTab,
    setLoader,
    setGameReference,
    searchParams,
    setMoveLoader,
    setReference,
    setUserUploads,
    uploadFilterByPos,
    tourType,
    tourStepNumber,
    setTourNextStep,
    loader,
    allPgnArr,
    activePgnTab,
    analyzingFenTabIndx,
    setScannerImg,
    setAnalyzingFenTabIndx,
    pgn,
    activeMove,
    promoteVariation,
    userInfo,
    plans,
    connectToPro,
    getUserServersInfo,
    searchParamsLichess,
    searchParamsLichessPlayer,
    setNavigationGamesInfo,
    setLichessDB,
    setPgn,
    navigationGameIndx,
    navigationGames,
    navigationGamesTabs,
    navigationPages,
    setSubModal,
    setBringServersSocketData,
    setCurrentlyAnalyzingModal,
    isFocus,
    setIsFocus,
    isGuestUser,
    setLoginModal,
  } = props;

  const [activeVarOpt, setActiveVarOpt] = useState(false);
  const [nextMove, setNextMove] = useState(null);
  const [symbolMode, setSymbolMode] = useState('');
  const [commentField, setCommentField] = useState(false);
  const [contextmenuCoords, setContextmenuCoords] = useState({
    x: 0,
    y: 0,
    reverse: false,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [videoLimit, setVideoLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    message: '',
    percent: null,
  });

  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [enginesOptionsList, setEnginesOptionsList] = useState({});
  const [availableServers, setAvailableServers] = useState([]);
  const [explanationsContainer, setExplanationsContainer] = useState(false);
  const [editComment, setEditComment] = useState({});
  const [newComment, setNewComment] = useState({});
  const [sortByName, setSortByName] = useState(false);
  const [isLoadingLichess, setIsLoadingLichess] = useState(null);
  const [chessAISocketResp, setChessAISocketResp] = useState([]);
  const [activeTabBottom, setActiveTabBottom] = useState(0);
  const [serversSocketResp, setServersSocketResp] = useState({});
  const [prevServersSocketResp, setPrevServersSocketResp] = useState({});
  const [ctrlKeyPressed, setCtrlKeyPressed] = useState(false);
  const [aKeyPressed, setAKeyPressed] = useState(false);
  const [stopLastServer, setStopLastServer] = useState(false);
  const [bringServersMessage, setBringServersMessage] = useState(false);

  const altKey = useKeyPress(18);
  const upKey = useKeyPress(38);
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisLoader, setAnalysisLoader] = useState(false);
  const [analysisStopLoader, setAnalysisStopLoader] = useState(false);

  const saveFileContentHandler = () => {
    setIsLoading(true);
    let fileList = getFileList();

    const path = '/' + activeFileInfo.path + '/';
    uploadFiles(path, fileList, userInfo).then(() => {
      setCurrentDirectory('/');
      setIsLoading(false);
    });
  };

  const switchAnalysisTabHandler = () => {
    setAnalyzingFenTabIndx(activePgnTab);
    handleAnalyze(activePgnTab);
  };
  const updateSymbolMode = (mode) => {
    setSymbolMode(mode);
    window.localStorage.setItem(SYMBOL_MODE_LS_OPTION, mode);
  };

  const updateReferences = () => {
    setMoveLoader(true);
    setLoader('gameRefLoader');
    setGameReference(false, searchParams);
    setReference(fen, searchParams ? searchParams : '');
  };

  const checkIsEqualObjects = (serversData, serversSocketResp) => {
    const serversDataProperties = Object.keys(serversData);
    const serversSocketRespProperties = Object.keys(serversSocketResp);

    if (serversDataProperties.length !== serversSocketRespProperties.length) {
      return false;
    }
    if (
      serversDataProperties.length === 0 &&
      serversSocketRespProperties.length === 0
    ) {
      return true;
    }
    for (const key of serversDataProperties) {
      const serversDataVal = serversData[key];
      const serversSocketRespVal = serversSocketResp[key];

      if (
        typeof serversDataVal === 'object' &&
        typeof serversSocketRespVal === 'object'
      ) {
        if (!checkIsEqualObjects(serversDataVal, serversSocketRespVal)) {
          return false;
        }
      } else if (serversDataVal !== serversSocketRespVal) {
        return false;
      }
    }
    return true;
  };

  const connectFileUploadSocket = () => {
    let pingInterval = null;
    var socket = new WebSocket(
      `${SOCKET_URL}/ws/upload_progress/${filterAlphanumeric(
        userInfo.username
      )}/`
    );

    socket.onopen = function (event) {
      pingInterval = setInterval(function () {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping'); // Send ping message
        }
      }, 30000); // Ping every 30 seconds
    };

    socket.onmessage = function (event) {
      var { data } = JSON.parse(event.data);
      if (data.progress) {
        const progressDetails = data.progress.match(regex);
        const progressPercent = Math.round(
          (progressDetails[0] / progressDetails[1]) * 100
        );
        if (progressPercent === 100) {
          setUploadProgress({
            message: '',
            percent: null,
          });
          setLoader('fileLoader');
          setUserUploads('/', userInfo);
        } else {
          setUploadProgress({
            message: data.progress,
            percent: progressPercent,
          });
        }
      }
    };

    socket.onclose = (e) => {
      clearInterval(pingInterval); // Clear the heartbeat interval

      // Attempt to reconnect with a delay
      setTimeout(connectFileUploadSocket, 5000);
    };

    socket.onerror = function (event, error) {
      console.log('FAILED', event);
    };
  };

  const bringServersSocket = () => {
    let pingInterval = 0;
    const socket = new WebSocket(`${SOCKET_URL}/ws/bring_servers/${filterAlphanumeric(userInfo.username)}/`)
    socket.onopen = function (event) {
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping")
        }

      }, 30000)
      setBringServersSocketData(socket)
    }
    socket.onmessage = async function (event) {
      if (event.data === "pong") {
        return;
      }
      const data = JSON.parse(event.data);

      if (data && data.bring_called) {
        setBringServersMessage(data.bring_called)
      }
    }

    socket.onerror = function (event) {
      console.log("BRING SERVERS ERROR", event)
      socket.close();
    };
    socket.onclose = function (event) {
      clearInterval(pingInterval)
      bringServersSocket();
    };
  }
  const connectUserServerSocket = () => {
    let pingInterval = null;
    var socket = new WebSocket(
      `${SOCKET_URL}/ws/user_server_info/${filterAlphanumeric(
        userInfo.username
      )}/`
    );
    socket.onopen = function (event) {
      pingInterval = setInterval(function () {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping'); // Send ping message
        }
      }, 30000); // Ping every 30 seconds
    };
    socket.onmessage = function (event) {
      var { data } = JSON.parse(event.data);
      let serversData = data.servers;
      let availableServersData = data.available_servers;
      setAvailableServers(availableServersData);

      if (!data.skip_servers) {
        setServersSocketResp(serversData);
        getUserServersInfo({ servers: serversData });
      }
    };
    socket.onclose = (e) => {
      clearInterval(pingInterval); // Clear the heartbeat interval
      // Attempt to reconnect with a delay
      setTimeout(connectUserServerSocket, 5000);
    };
    socket.onerror = (err) => {
      console.error(
        'Socket encountered error: ',
        err.message,
        'Closing socket'
      );
      socket.close();
    };
  };
  const regex = /(\d)+\s/g;

  const toggleSymbolChange = () =>
    updateSymbolMode(symbolMode === 'symbol' ? 'notation' : 'symbol');

  const getFileList = () => {
    let file = new File([pgnStr], activeFileInfo.file.key.split('/')[2], {
      type: 'application/vnd.chess-pgn',
    });

    let transfer = new DataTransfer();
    transfer.items.add(file);
    let fileList = transfer.files;
    return fileList;
  };

  const setNewTab = (index) => {
    let pathname = getLinkFromIndex(index);
    navigate({ pathname: pathname });
  };
  const connectGptAnalysis = () => {
    let pingInterval = null;
    var socket = new WebSocket(
      `${SOCKET_URL}/ws/gpt_analysis/${filterAlphanumeric(
        userInfo.username
      )}/`
    );

    socket.onopen = function (event) {
      pingInterval = setInterval(function () {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping'); // Send ping message
        }
      }, 30000); // Ping every 30 seconds
    };

    socket.onmessage = function (event) {
      var { data } = JSON.parse(event.data);
      let analysisData = data.analysis_data;
      setChessAISocketResp((chessAISocketResp) => [
        ...chessAISocketResp,
        analysisData,
      ]);
    };
    socket.onerror = function (error) {
      console.error(
        'Socket encountered error: ',
        error.message,
        'Closing gptSocket'
      );
      socket.close();
    };
    socket.onclose = function (event) {
      clearInterval(pingInterval);
      setTimeout(connectGptAnalysis, 5000);
    };
  }
  useEffect(() => {
    const identifier = setTimeout(() => {
      if (
        searchParamsLichessPlayer.player &&
        searchParamsLichessPlayer.player.length
      ) {
        setLichessDB(searchParamsLichessPlayer, setIsLoadingLichess);
      } else {
        setLichessDB(searchParamsLichess);
      }
    }, 100);
    return () => {
      clearTimeout(identifier);
    };
  }, [fen]);

  useEffect(() => {
    setLichessDB(searchParamsLichess);
  }, []);

  useEffect(() => {
    if (userInfo && userInfo.username) {
      connectUserServerSocket();
    }
  }, [userInfo ? userInfo.username : null]);

  useEffect(() => {
    if (userInfo && userInfo.username) {
      connectGptAnalysis();
    }
  }, [userInfo ? userInfo.username : null]);


  useEffect(() => {
    if (userInfo && userInfo.username) {
      connectFileUploadSocket();
    }
  }, [userInfo ? userInfo.username : null]);

  useEffect(() => {
    if (Object.keys(serversSocketResp).length === 0) {
      connectToPro({});
      sessionStorage.removeItem("tabs")
      setCurrentlyAnalyzingModal(false)
      setSubModal("")
    } else if (!checkIsEqualObjects(prevServersSocketResp, serversSocketResp)) {
      if (Boolean(sessionStorage.getItem("tabs"))) {
        setPrevServersSocketResp(serversSocketResp);
        connectToPro(serversSocketResp);
      } else {
        setSubModal("currently_analyzing")
      }
    }
  }, [serversSocketResp]);

  useEffect(() => { }, [availableServers]);

  useEffect(() => {
    if (window.localStorage.getItem(SYMBOL_MODE_LS_OPTION) === 'symbol') {
      updateSymbolMode('symbol');
    } else {
      updateSymbolMode('notation');
    }
  });

  useEffect(() => {
    if (loader === 'activate-gpt') {
      setActiveTabBottom(3);
    } else if (!loader.length && createFolderModal) {
      setCreateFolderModal(false);
    }
  }, [loader]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      updateReferences();
      if (tourType === 'study' && tourStepNumber === 1) {
        setTourNextStep();
      }
    }, 100);
    return () => {
      clearTimeout(identifier);
    };
  }, [fen]);

  useEffect(() => {
    updateReferences();
    setNavigationGamesInfo(0);
  }, []);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (uploadFilterByPos) {
        setLoader('fileLoader');
        setUserUploads('/', userInfo);
      }
    }, 100);
    return () => {
      clearTimeout(identifier);
    };
  }, [fen]);

  useEffect(() => {
    setLoader('fileLoader');
    if (userInfo && userInfo.token && !isGuestUser)
      setUserUploads('/', userInfo);
  }, [uploadFilterByPos]);

  useEffect(() => {
    const downHandler = (event) => {
      if (event.which === 17) {
        setCtrlKeyPressed(true);
      }
      if (event.which === 65) {
        setAKeyPressed(true);
      }
    };

    window.addEventListener('keydown', downHandler);
    return () => {
      window.removeEventListener('keydown', downHandler);
    };
  }, [activeMove]);

  useEffect(() => {
    const isOpen = document.querySelectorAll('.modal-dialog').length > 0;
    if (aKeyPressed && ctrlKeyPressed && !isOpen) {
      if (
        !activeMove ||
        (Object.keys(activeMove).length === 0 &&
          activeMove.constructor === Object)
      ) {
        setAKeyPressed(false);
        setCtrlKeyPressed(false);
        return;
      }

      if (activeMove.comments && activeMove.comments.length === 0) {
        setCommentField(true);
        setAKeyPressed(false);
        setCtrlKeyPressed(false);
        return;
      }

      let hasText = false;
      let lastTextIndx = null;
      activeMove.comments.forEach((comment, indx) => {
        if (comment.text) {
          hasText = true;
          lastTextIndx = indx;
        }
      });

      if (!hasText) {
        setCommentField(true);
        setAKeyPressed(false);
        setCtrlKeyPressed(false);
        return;
      } else {
        setEditComment({
          id: activeMove.move_id,
          index: lastTextIndx,
        });
        setNewComment({
          comment: activeMove.comments[lastTextIndx].text,
          position: activeMove.comments[lastTextIndx].text.length - 1,
        });
      }
      setAKeyPressed(false);
      setCtrlKeyPressed(false);
    }
  }, [aKeyPressed, ctrlKeyPressed]);

  useEffect(() => {
    const isOpen = document.querySelectorAll('.modal-dialog').length > 0;
    if (altKey && upKey && !isOpen && activeTab === 0) {
      if (
        !activeMove ||
        (Object.keys(activeMove).length === 0 &&
          activeMove.constructor === Object)
      ) {
        return;
      }
      promoteVariation(activeMove);
    }
  }, [altKey, upKey]);

  useEffect(() => {
    if (
      navigationGames &&
      navigationGames.games &&
      navigationGames.games.length &&
      navigationGameIndx > -1 &&
      !allPgnArr[activePgnTab].tabFile.path &&
      navigationGamesTabs.includes(activePgnTab)
    ) {
      const navIndx = navigationGameIndx - navigationPages[0] * 10;
      setPgn(navigationGames.games[navIndx].pgn);
    }
  }, [navigationGameIndx]);

  useEffect(() => {
    if (userInfo && userInfo.username) {
      bringServersSocket(userInfo)
    }
  }, [userInfo ? userInfo.username : null]);

  useEffect(async () => {
    if (bringServersMessage) {
      if (!Boolean(sessionStorage.getItem('tabs')) && isFocus) {
        const servers = await getUserServersData();
        if (servers && servers.servers && Object.keys(servers.servers).length > 0) {
          getUserServersInfo(servers)
          connectToPro(servers.servers)
          setAnalyzingFenTabIndx(activePgnTab)
          setCurrentlyAnalyzingModal(false)
          setIsFocus(false)

        }

      } else {
        sessionStorage.removeItem('tabs')
        connectToPro({})
        setCurrentlyAnalyzingModal(true)
        setAnalyzingFenTabIndx(null)
      }
      setBringServersMessage(false)
    }
  }, [bringServersMessage]);

  useEffect(() => {
    const activeTabLink = findLinkTabIndex(location.pathname);
    setActiveTab(activeTabLink);
    if (
      activeTabLink === 1 &&
      (tourType === 'study' || tourType === 'prepare') &&
      (tourStepNumber === 0 || tourStepNumber === -1)
    ) {
      setTourNextStep();
    }
  }, [location.pathname]);

  return (
    <React.Fragment>
      <div className="dsk-pgn-viewer ml-3">
        <Tabs
          selectedIndex={activeTab}
          onSelect={(index) => {
            setNewTab(index);
          }}
        >
          <div className="pgn-viewer-header">
            <TabList className="tab-style--1">
              <div>
                <Tab>
                  <img
                    src={activeTab === 0 ? ACTIVE_NOTATION : INACTIVE_NOTATION}
                    height={20}
                    width={20}
                    alt=""
                  />
                  <span>Notation</span>
                </Tab>
                <Tab>
                  <div id="referenceTab">
                    <img
                      src={
                        activeTab === 1 ? ACTIVE_REFERENCE : INACTIVE_REFERENCE
                      }
                      height={20}
                      width={20}
                      alt=""
                    />
                    <span>Reference</span>
                  </div>
                </Tab>
                <Tab>
                  <div>
                    <img
                      src={
                        activeTab === 2 ? ACTIVE_REFERENCE : INACTIVE_REFERENCE
                      }
                      height={20}
                      width={20}
                      alt=""
                    />
                    <span>Lichess Database</span>
                  </div>
                </Tab>
                <Tab>
                  <div id="uploadsTab">
                    <IoMdFolder
                      height={20}
                      width={20}
                      className="uploads"
                      style={{ color: activeTab === 3 ? '#358C65' : '#959D99' }}
                    />
                    <span>Cloud Storage</span>
                  </div>
                </Tab>
                <Tab>
                  <FaVideo
                    height={20}
                    width={20}
                    className="uploads"
                    style={{ color: activeTab === 4 ? '#358C65' : '#959D99' }}
                  />
                  <span>Video Search</span>
                </Tab>
                <Tab>
                  <FaRegFilePdf
                    height={20}
                    width={20}
                    className="uploads"
                    style={{ color: activeTab === 5 ? '#358C65' : '#959D99' }}
                  />
                  <span>PDF Scanner</span>
                </Tab>
              </div>
            </TabList>
          </div>
          <div className="pgn-viewer-body">
            <TabPanel>
              <MultiTabNotations
                handleAnalyze={handleAnalyze}
                toggleSymbolChange={toggleSymbolChange}
                symbolMode={symbolMode}
              />
              <div>
                {Object.keys(activeFileInfo).length !== 0 &&
                  activeFileInfo.file &&
                  activeFileInfo.file.key &&
                  allPgnArr[activePgnTab] &&
                  allPgnArr[activePgnTab].tabFile &&
                  allPgnArr[activePgnTab].tabFile.key ? (
                  <div className="d-flex flex-row justify-content-between">
                    <div className="uploaded-folder-title">
                      <RiFile3Fill className="uploaded-icons-file" />
                      <span>
                        {activeFileInfo.file.key.split('/')[1] +
                          '/' +
                          activeFileInfo.file.key.split('/')[2]}
                      </span>
                    </div>

                    <div className="d-flex flex-row justify-content-end uploaded-folder-func">
                      <button
                        className="apply-btn file-save-btn"
                        variant="primary"
                        type="button"
                        onClick={() => saveFileContentHandler()}
                      >
                        {isLoading ? (
                          <div className="circle-loader"></div>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
                <Variations
                  symbolModeEnabled={symbolMode === 'symbol'}
                  setContextmenuCoords={setContextmenuCoords}
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                  editComment={editComment}
                  setEditComment={setEditComment}
                  newComment={newComment}
                  setNewComment={setNewComment}
                />
                {showMenu ? (
                  <MoveContextmenu
                    setCommentField={setCommentField}
                    top={contextmenuCoords.y}
                    left={contextmenuCoords.x}
                    reverse={contextmenuCoords.reverse}
                  />
                ) : (
                  <> </>
                )}
                <div>
                  <Toolbar
                    isCommentField={commentField}
                    setCommentField={setCommentField}
                    setLoginModal={setLoginModal}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="d-flex flex-column">
                {pgn && pgn.moves && pgn.moves.length ? (
                  <Variations
                    symbolModeEnabled={symbolMode === 'symbol'}
                    setContextmenuCoords={setContextmenuCoords}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    fromRef={true}
                  />
                ) : (
                  <></>
                )}
                <div>
                  <div className="reference-divider"></div>
                  <div className="reference-content">
                    <MoveReference />
                  </div>
                  <div className="reference-divider"></div>
                  <div className="reference-content">
                    <BoardReference />
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="d-flex flex-column">
                {pgn && pgn.moves && pgn.moves.length ? (
                  <Variations
                    symbolModeEnabled={symbolMode === 'symbol'}
                    setContextmenuCoords={setContextmenuCoords}
                    showMenu={showMenu}
                    setShowMenu={setShowMenu}
                    fromRef={true}
                  />
                ) : (
                  <></>
                )}
                <div>
                  <div className="reference-divider"></div>
                  <LichessDatabase
                    isLoading={isLoadingLichess}
                    setIsLoading={setIsLoadingLichess}
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <Uploads
                uploadProgress={uploadProgress}
                setCreateFolderModal={setCreateFolderModal}
                sortByName={sortByName}
                setSortByName={setSortByName}
                setLoginModal={setLoginModal}
              />
            </TabPanel>
            <TabPanel>
              <VideosArea
                fen={fen}
                tabIsOpen={activeTab === 4}
                setVideoLimit={setVideoLimit}
                setLoginModal={setLoginModal}
              />
            </TabPanel>
            <TabPanel>
              <PdfScanner
                setScannerImg={setScannerImg}
                setLoginModal={setLoginModal}
              />
            </TabPanel>
          </div>
        </Tabs>
        <VariationActions
          activeTab={activeTab}
          activeVarOpt={activeVarOpt}
          isCommentField={commentField}
          editComment={editComment}
          setActiveVarOpt={setActiveVarOpt}
          setNextMove={setNextMove}
        />
        {variationOpt ? <VariationOptionsModal isOpen={variationOpt} /> : <></>}
        {activeVarOpt ? (
          <ActiveVarOptionsModal
            isOpen={activeVarOpt}
            setIsOpen={setActiveVarOpt}
            nextMove={nextMove}
          />
        ) : (
          <></>
        )}
      </div>
      <Tabs
        selectedIndex={activeTabBottom}
        onSelect={(index) => {
          if (index === 2 && isGuestUser) {
            setLoginModal(true);
            return;
          }
          setActiveTabBottom(index);
        }}
        className="analysis-sec"
      >
        <TabList className="tab-style--1 mt--10 ml-3">
          <Tab>
            <SlGraph /> Analysis
          </Tab>
          <Tab>
            <GoGraph /> Full Game Analysis
          </Tab>
          {plans && plans.decode_chess ? (
            <Tab>
              <GiChessKing /> Decode Chess
            </Tab>
          ) : (<></>)
          }
          {plans && plans.has_access_chessai_buddy ? (
            <Tab>ChessGPT 🔥</Tab>
          ) : (
            <></>
          )}
        </TabList>
        <TabPanel>
          {analyzingFenTabIndx === null ||
            analyzingFenTabIndx === activePgnTab ? (
            <div
              id="analysisAreaEngines"
              className="mt--10 ml-3 analysis-area-engines"
            >
              <AnalysisArea
                handleAnalyze={handleAnalyze}
                fenToAnalyze={fenToAnalyze}
                setFenToAnalyze={setFenToAnalyze}
                enginesOptionsList={enginesOptionsList}
                setStopLastServer={setStopLastServer}
                stopLastServer={stopLastServer}
                analysisLoader={analysisLoader}
                analysisStopLoader={analysisStopLoader}
                setAnalysisStopLoader={setAnalysisStopLoader}
              />
              <DesktopEnginesList
                handleAnalyze={handleAnalyze}
                fenToAnalyze={fenToAnalyze}
                setFenToAnalyze={setFenToAnalyze}
                enginesOptionsList={enginesOptionsList}
                setEnginesOptionsList={setEnginesOptionsList}
                availableServers={availableServers}
                setAvailableServers={setAvailableServers}
                isGuestUser={isGuestUser}
                setLoginModal={setLoginModal}
                analysisLoader={analysisLoader}
                setAnalysisLoader={setAnalysisLoader}
                analysisStopLoader={analysisStopLoader}
              />
            </div>
          ) : (
            <button
              className="ml-3 apply-btn switch-analysis-btn"
              onClick={() => switchAnalysisTabHandler()}
            >
              Bring Analysis Here
            </button>
          )}
        </TabPanel>
        <TabPanel>
          <FullGameAnalysis
            availableServers={availableServers}
            enginesOptionsList={enginesOptionsList}
            setLoginModal={setLoginModal}
            setCurrentlyAnalyzingModal={setCurrentlyAnalyzingModal}
          />
        </TabPanel>
        {plans && plans.decode_chess ? (
          <TabPanel>
            <DecodeChess
              explanationsContainer={explanationsContainer}
              setExplanationsContainer={setExplanationsContainer}
            />
          </TabPanel>
        ) : <></>
        }
        {plans && plans.has_access_chessai_buddy ? (
          <TabPanel>
            <ChessAIBuddy
              chessAISocketResp={chessAISocketResp}
              setChessAISocketResp={setChessAISocketResp}
            />
          </TabPanel>
        ) : (
          <></>
        )}
      </Tabs>
      <UploadsLimitModal
        showModal={videoLimit}
        setShowModal={setVideoLimit}
        limitType="videoSearch"
      />
      <CreateNewFolderModal
        isOpen={createFolderModal}
        setIsOpen={setCreateFolderModal}
        setLoginModal={setLoginModal}
      />
      <Onboarding />
      <OnboardingTutorial />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setUserUploads,
  setTourNextStep,
  setAnalyzingFenTabIndx,
  promoteVariation,
  setLichessDB,
  connectToPro,
  getUserServersInfo,
  setNavigationGamesInfo,
  setLichessDB,
  setPgn,
  setSubModal,
})(DesktopPGNViewer);
