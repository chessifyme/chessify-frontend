import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Variations from './Variations';
import VariationActions from './VariationActions';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Toolbar from './Toolbar';
import DesktopEnginesList from './DesktopEnginesList';
import MoveReference from './MoveReference';
import BoardReference from './BoardReference';
import VariationOptionsModal from './VariationOptionsModal';
import { IoMdFolder } from 'react-icons/io';
import { FaVideo } from 'react-icons/fa';
import { RiFile3Fill } from 'react-icons/ri';
import { connect } from 'react-redux';
import Uploads from './Uploads';
import MoveContextmenu from './MoveContextmenu';
import AnalysisArea from './AnalysisArea';
import VideosArea from './VideosArea';
import UploadsLimitModal from './UploadsLimitModal';
import {
  uploadFiles,
  setCurrentDirectory,
  setGameRefLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setLoader,
  setUserUploads,
  setTourNextStep,
} from '../../actions/board';
import ActiveVarOptionsModal from './ActiveVarOptionsModal';
import CreateNewFolderModal from './CreateNewFolderModal';
import Onboarding from './Onboarding';
import OnboardingTutorial from './OnboardingTutorial';
import MultiTabNotations from './MultiTabNotations';

const mapStateToProps = (state) => {
  return {
    variationOpt: state.board.variationOpt,
    activeFileInfo: state.board.activeFileInfo,
    pgnStr: state.board.pgnStr,
    searchParams: state.board.searchParams,
    userFullInfo: state.cloud.userFullInfo,
    fen: state.board.fen,
    uploadFilterByPos: state.board.uploadFilterByPos,
    loader: state.board.loader,
    tourType: state.board.tourType,
    tourStepNumber: state.board.tourStepNumber,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
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
    userFullInfo,
    handleAnalyze,
    fenToAnalyze,
    setFenToAnalyze,
    uploadFiles,
    setCurrentDirectory,
    activeTab,
    setActiveTab,
    setGameRefLoader,
    setGameReference,
    searchParams,
    setMoveLoader,
    setReference,
    setLoader,
    setUserUploads,
    uploadFilterByPos,
    tourType,
    tourStepNumber,
    setTourNextStep,
    loader,
    allPgnArr,
    activePgnTab,
    analyzingFenTabIndx,
  } = props;
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
  const [activeVarOpt, setActiveVarOpt] = useState(false);
  const [nextMove, setNextMove] = useState(null);
  const [createFolderModal, setCreateFolderModal] = useState(false);

  const updateSymbolMode = (mode) => {
    setSymbolMode(mode);
    window.localStorage.setItem(SYMBOL_MODE_LS_OPTION, mode);
  };

  const regex = /(\d)+\s/g;
  useEffect(() => {
    var socket = new WebSocket(
      `wss://chessify.me/ws/upload_progress/${userFullInfo.username}/`
    );

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
          setUserUploads('/', userFullInfo);
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
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(SYMBOL_MODE_LS_OPTION) === 'symbol') {
      updateSymbolMode('symbol');
    } else {
      updateSymbolMode('notation');
    }
  });

  useEffect(() => {
    if (!loader.length && createFolderModal) {
      setCreateFolderModal(false);
      if (tourType === 'analyze' && tourStepNumber === 2) {
        setTourNextStep();
      }
    }
  }, [loader]);

  const updateReferences = () => {
    setMoveLoader(true);
    setGameRefLoader(true);
    setGameReference(false, searchParams);
    setReference(fen, searchParams ? searchParams : '');
  };

  useEffect(() => {
    updateReferences();
    if (tourType === 'study' && tourStepNumber === 1) {
      setTourNextStep();
    }
  }, [fen]);

  useEffect(() => {
    updateReferences();
  }, []);

  useEffect(() => {
    if (uploadFilterByPos) {
      setLoader('fileLoader');
      setUserUploads('/', userFullInfo);
    }
  }, [fen]);

  useEffect(() => {
    setLoader('fileLoader');
    setUserUploads('/', userFullInfo);
  }, [uploadFilterByPos]);

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

  const saveFileContentHandler = () => {
    setIsLoading(true);
    let fileList = getFileList();

    const path = '/' + activeFileInfo.path + '/';
    uploadFiles(path, fileList, userFullInfo).then(() => {
      setCurrentDirectory('/');
      setIsLoading(false);
    });
  };

  return (
    <React.Fragment>
      <div className="dsk-pgn-viewer ml-3">
        <Tabs
          selectedIndex={activeTab}
          onSelect={(index) => setActiveTab(index)}
        >
          <div className="pgn-viewer-header">
            <TabList className="tab-style--1">
              <div>
                <Tab onClick={() => setActiveTab(0)}>
                  <img
                    src={activeTab === 0 ? ACTIVE_NOTATION : INACTIVE_NOTATION}
                    height={20}
                    width={20}
                    alt=""
                  />
                  <span>Notation</span>
                </Tab>
                <Tab
                  onClick={() => {
                    setActiveTab(1);
                    if (
                      (tourType === 'study' || tourType === 'prepare') &&
                      (tourStepNumber === 0 || tourStepNumber === -1)
                    ) {
                      setTourNextStep();
                    }
                  }}
                >
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
                <Tab
                  onClick={() => {
                    setActiveTab(2);
                  }}
                >
                  <div id="uploadsTab">
                    <IoMdFolder
                      height={20}
                      width={20}
                      className="uploads"
                      style={{ color: activeTab === 2 ? '#358C65' : '#959D99' }}
                    />
                    <span>Uploads</span>
                  </div>
                </Tab>
                <Tab
                  onClick={() => {
                    setActiveTab(3);
                  }}
                >
                  <FaVideo
                    height={20}
                    width={20}
                    className="uploads"
                    style={{ color: activeTab === 3 ? '#358C65' : '#959D99' }}
                  />
                  <span>Video Search</span>
                </Tab>
              </div>
              <div className="pgn-regulation">
                <div className="toggle-btn">
                  <p className="letter-toggle">N</p>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          onChange={toggleSymbolChange}
                          checked={symbolMode === 'symbol' ? true : false}
                          value="active"
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
            </TabList>
          </div>
          <div className="pgn-viewer-body">
            <TabPanel>
              <MultiTabNotations handleAnalyze={handleAnalyze} />
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
                  />
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="reference-content">
                <MoveReference />
              </div>
              <div className="reference-divider"></div>
              <div className="reference-content">
                <BoardReference setActiveTab={setActiveTab} />
              </div>
            </TabPanel>
            <TabPanel>
              <Uploads
                setActiveTab={setActiveTab}
                uploadProgress={uploadProgress}
                setCreateFolderModal={setCreateFolderModal}
              />
            </TabPanel>
            <TabPanel>
              <VideosArea
                fen={fen}
                tabIsOpen={activeTab === 3}
                setVideoLimit={setVideoLimit}
              />
            </TabPanel>
          </div>
        </Tabs>
        <VariationActions
          activeVarOpt={activeVarOpt}
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
      {analyzingFenTabIndx === null || analyzingFenTabIndx === activePgnTab ? (
        <div
          id="analysisAreaEngines"
          className="mt--10 ml-3 analysis-area-engines"
        >
          <AnalysisArea
            handleAnalyze={handleAnalyze}
            fenToAnalyze={fenToAnalyze}
            setFenToAnalyze={setFenToAnalyze}
          />
          <DesktopEnginesList
            handleAnalyze={handleAnalyze}
            fenToAnalyze={fenToAnalyze}
            setFenToAnalyze={setFenToAnalyze}
          />
        </div>
      ) : (
        <></>
      )}
      <UploadsLimitModal
        showModal={videoLimit}
        setShowModal={setVideoLimit}
        limitType="videoSearch"
      />
      <CreateNewFolderModal
        isOpen={createFolderModal}
        setIsOpen={setCreateFolderModal}
      />
      <Onboarding setActiveTab={setActiveTab} />
      <OnboardingTutorial />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  uploadFiles,
  setCurrentDirectory,
  setGameRefLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setLoader,
  setUserUploads,
  setTourNextStep,
})(DesktopPGNViewer);
