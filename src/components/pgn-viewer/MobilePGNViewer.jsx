import React, { useState, useEffect } from 'react';
import { withOrientationChange } from 'react-device-detect';
import MobileEnginesList from './MobileEnginesList';
import Variations from './Variations';
import VariationActions from './VariationActions';
import Toolbar from './Toolbar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import MoveReference from './MoveReference';
import BoardReference from './BoardReference';
import VariationOptionsModal from './VariationOptionsModal';
import Uploads from './Uploads';
import { IoMdFolder } from 'react-icons/io';
import { RiFile3Fill } from 'react-icons/ri';
import { GoGraph } from 'react-icons/go';
import { GiChessKing } from 'react-icons/gi';
import { SlGraph } from 'react-icons/sl';
import AnalysisArea from './AnalysisArea';
import { connect } from 'react-redux';
import {
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setUserUploads,
  setAnalyzingFenTabIndx,
  setLichessDB,
  setNavigationGamesInfo,
  setPgn,
} from '../../actions/board';
import { connectToPro, getUserServersInfo, setSubModal } from '../../actions/cloud';
import VideosArea from './VideosArea';
import UploadsLimitModal from './UploadsLimitModal';
import { FaVideo, FaRegFilePdf } from 'react-icons/fa';
import MultiTabNotations from './MultiTabNotations';
import PdfScanner from './PdfScanner';
import DecodeChess from '../common/DecodeChess';
import FullGameAnalysis from './FullGameAnalysis';
import ActiveVarOptionsModal from './ActiveVarOptionsModal';
import CreateNewFolderModal from './CreateNewFolderModal';
import LichessDatabase from './LichessDatabase';
import ChessAIBuddy from './ChessAIBuddy';
import { filterAlphanumeric } from '../../utils/utils';
import { SOCKET_URL } from '../../constants/cloud-params';
import { getUserServersData } from '../../utils/api'
import { useLocation, useNavigate } from 'react-router-dom';
import { findLinkTabIndex, getLinkFromIndex } from '../../utils/pgn-viewer';

const SYMBOL_MODE_LS_OPTION = 'dashboard:symbolMode';
const ACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-active.svg');
const INACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-inactive.svg');
const ACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-active.svg');
const INACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-inactive.svg');

const mapStateToProps = (state) => {
  return {
    variationOpt: state.board.variationOpt,
    pgnStr: state.board.pgnStr,
    pgn: state.board.pgn,
    userInfo: state.cloud.userInfo,
    activeFileInfo: state.board.activeFileInfo,
    fen: state.board.fen,
    searchParams: state.board.searchParams,
    uploadFilterByPos: state.board.uploadFilterByPos,
    loader: state.board.loader,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
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

const MobilePGNViewer = (props) => {
  const {
    variationOpt,
    activeFileInfo,
    pgnStr,
    userInfo,
    handleAnalyze,
    fenToAnalyze,
    setFenToAnalyze,
    uploadFiles,
    setCurrentDirectory,
    activeTab,
    setActiveTab,
    fen,
    setLoader,
    setGameReference,
    setMoveLoader,
    setReference,
    setUserUploads,
    searchParams,
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
    setLichessDB,
    searchParamsLichess,
    searchParamsLichessPlayer,
    plans,
    connectToPro,
    getUserServersInfo,
    setNavigationGamesInfo,
    setPgn,
    navigationGameIndx,
    navigationGames,
    navigationGamesTabs,
    navigationPages,
    setBringServersSocketData,
    setCurrentlyAnalyzingModal,
    setSubModal,
    isFocus,
    setIsFocus,
    isGuestUser,
    setLoginModal,
  } = props;
  const [symbolMode, setSymbolMode] = useState('');
  const [commentField, setCommentField] = useState(false);
  const [videoLimit, setVideoLimit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    message: '',
    percent: null,
  });
  const [createFolderModal, setCreateFolderModal] = useState(false);
  const [enginesOptionsList, setEnginesOptionsList] = useState({});
  const [availableServers, setAvailableServers] = useState([]);
  const [activeVarOpt, setActiveVarOpt] = useState(false);
  const [nextMove, setNextMove] = useState(null);
  const [explanationsContainer, setExplanationsContainer] = useState(false);
  const [editComment, setEditComment] = useState({});
  const [sortByName, setSortByName] = useState(false);
  const [isLoadingLichess, setIsLoadingLichess] = useState(null);
  const [chessAISocketResp, setChessAISocketResp] = useState([]);
  const [activeTabBottom, setActiveTabBottom] = useState(0);
  const [socketBuddyRegulate, setSocketBuddyRegulate] = useState(false);
  const [socketBuddyClosed, setSocketBuddyClosed] = useState(false);
  const [serversSocketResp, setServersSocketResp] = useState({});
  const [prevServersSocketResp, setPrevServersSocketResp] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [analysisLoader, setAnalysisLoader] = useState(false);
  const [analysisStopLoader, setAnalysisStopLoader] = useState(false);
  const [bringServersMessage, setBringServersMessage] = useState(false);

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
    navigate({ pathname: pathname, search: search });
  };

  const regex = /(\d)+\s/g;

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
    socket.onerror = function (event, error) {
      console.log('FAILED', event);
    };

    socket.onclose = (e) => {
      clearInterval(pingInterval); // Clear the heartbeat interval
      // Attempt to reconnect with a delay
      setTimeout(connectFileUploadSocket, 5000);
    };
  };

  useEffect(() => {
    if (userInfo && userInfo.username) {
      connectUserServerSocket();
    }
  }, [userInfo ? userInfo.username : null]);

  useEffect(() => {
    if (socketBuddyRegulate === null && userInfo && userInfo.username)
      setSocketBuddyRegulate(false);
  }, [userInfo ? userInfo.username : null]);

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
    if (loader === 'activate-gpt') {
      setActiveTabBottom(3);
    } else if (!loader.length && createFolderModal) {
      setCreateFolderModal(false);
    }
  }, [loader]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (uploadFilterByPos) {
        setLoader('fileLoader');
        if (userInfo && userInfo.token && !isGuestUser)
          setUserUploads('/', userInfo);
      }
    }, 100);
    return () => {
      clearTimeout(identifier);
    };
  }, [fen]);

  useEffect(() => {
    setLoader('fileLoader');
    setUserUploads('/', userInfo);
  }, [uploadFilterByPos]);


  useEffect(() => {
    if (userInfo && userInfo.username) {
      connectFileUploadSocket();
    }
  }, [userInfo ? userInfo.username : null]);

  useEffect(() => {
    if (userInfo && userInfo.username) {
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
      socket.onerror = function (event, error) {
        setSocketBuddyClosed(null);
      };
      socket.onclose = function (event) {
        clearInterval(pingInterval);
        setSocketBuddyClosed(true);
      };
    }
  }, [socketBuddyRegulate]);

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
    <div className="mb-pgn-viewer">
      <div className="pgn-viewer-body">
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
                  analysisLoader={analysisLoader}
                  analysisStopLoader={analysisStopLoader}
                  setAnalysisStopLoader={setAnalysisStopLoader}
                />
                <MobileEnginesList
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
              <div className="switch-analysis-area">
                <button
                  className="apply-btn switch-analysis-btn"
                  onClick={() => switchAnalysisTabHandler()}
                >
                  Bring Analysis Here
                </button>
              </div>
            )}
          </TabPanel>
          <TabPanel>
            <FullGameAnalysis
              availableServers={availableServers}
              enginesOptionsList={enginesOptionsList}
              setLoginModal={setLoginModal}
            />
          </TabPanel>
          <TabPanel>
            <DecodeChess
              explanationsContainer={explanationsContainer}
              setExplanationsContainer={setExplanationsContainer}
            />
          </TabPanel>
          {plans && plans.has_access_chessai_buddy ? (
            <TabPanel>
              <ChessAIBuddy
                chessAISocketResp={chessAISocketResp}
                setChessAISocketResp={setChessAISocketResp}
                socketBuddyClosed={socketBuddyClosed}
                setSocketBuddyClosed={setSocketBuddyClosed}
                socketBuddyRegulate={socketBuddyRegulate}
                setSocketBuddyRegulate={setSocketBuddyRegulate}
              />
            </TabPanel>
          ) : (
            <></>
          )}
        </Tabs>
        <div className="mb-pgn-wrapper">
          <Tabs
            selectedIndex={activeTab}
            onSelect={(index) => {
              setNewTab(index);
            }}
          >
            <div className="pgn-regulation">
              <div className="pgn-viewer-header mt-4">
                <TabList className="tab-style-mb">
                  <Tab>
                    <img
                      src={
                        activeTab === 0 ? ACTIVE_NOTATION : INACTIVE_NOTATION
                      }
                      height={15}
                      width={15}
                      alt=""
                    />
                    <span
                      style={{ color: activeTab === 0 ? '#358C65' : '#959D99' }}
                    >
                      Notation
                    </span>
                  </Tab>
                  <Tab>
                    <div id="referenceTab">
                      <img
                        src={
                          activeTab === 1
                            ? ACTIVE_REFERENCE
                            : INACTIVE_REFERENCE
                        }
                        height={15}
                        width={15}
                        alt=""
                      />
                      <span
                        style={{
                          color: activeTab === 1 ? '#358C65' : '#959D99',
                        }}
                      >
                        Reference
                      </span>
                    </div>
                  </Tab>
                  <Tab>
                    <div>
                      <img
                        src={
                          activeTab === 2
                            ? ACTIVE_REFERENCE
                            : INACTIVE_REFERENCE
                        }
                        height={20}
                        width={20}
                        alt=""
                      />
                      <span>Lichess Database</span>
                    </div>
                  </Tab>
                  <Tab className="uploads-tab">
                    <div id="uploadsTab">
                      <IoMdFolder
                        height={15}
                        width={15}
                        className="uploads"
                        style={{
                          color: activeTab === 3 ? '#358C65' : '#959D99',
                        }}
                      />
                      <span
                        style={{
                          color: activeTab === 3 ? '#358C65' : '#959D99',
                        }}
                      >
                        Cloud Storage
                      </span>
                    </div>
                  </Tab>
                  <Tab className="uploads-tab">
                    <FaVideo
                      height={15}
                      width={15}
                      className="uploads"
                      style={{ color: activeTab === 4 ? '#358C65' : '#959D99' }}
                    />
                    <span
                      style={{ color: activeTab === 4 ? '#358C65' : '#959D99' }}
                    >
                      Video Search
                    </span>
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
                </TabList>
              </div>
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
                    <div className="d-flex flex-column justify-content-center">
                      <div className="uploaded-folder-title">
                        <RiFile3Fill className="uploaded-icons-file" />
                        <span>
                          {activeFileInfo.file.key.split('/')[1] +
                            '/' +
                            activeFileInfo.file.key.split('/')[2]}
                        </span>
                      </div>

                      <div className="d-flex flex-row ml-1 uploaded-folder-func">
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
                    setCommentField={setCommentField}
                    editComment={editComment}
                    setEditComment={setEditComment}
                  />
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
          {variationOpt ? (
            <VariationOptionsModal isOpen={variationOpt} />
          ) : (
            <></>
          )}
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
        <div>
          <VariationActions
            activeTab={activeTab}
            activeVarOpt={activeVarOpt}
            isCommentField={commentField}
            editComment={editComment}
            setActiveVarOpt={setActiveVarOpt}
            setNextMove={setNextMove}
          />
        </div>
      </div>
      <CreateNewFolderModal
        isOpen={createFolderModal}
        setIsOpen={setCreateFolderModal}
        setLoginModal={setLoginModal}
      />
      <UploadsLimitModal
        showModal={videoLimit}
        setShowModal={setVideoLimit}
        limitType="videoSearch"
      />
    </div>
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
  setAnalyzingFenTabIndx,
  setLichessDB,
  connectToPro,
  getUserServersInfo,
  setNavigationGamesInfo,
  setPgn,
  setSubModal
})(withOrientationChange(MobilePGNViewer));
