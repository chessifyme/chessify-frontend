import React, { useState, useEffect } from 'react';
import { withOrientationChange } from 'react-device-detect';
import MobileEnginesList from './MobileEnginesList';
import Variations from './Variations';
import VariationActions from './VariationActions';
import Toolbar from './Toolbar';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MoveReference from './MoveReference';
import BoardReference from './BoardReference';
import VariationOptionsModal from './VariationOptionsModal';
import Uploads from './Uploads';
import { IoMdFolder } from 'react-icons/io';
import { RiFile3Fill } from 'react-icons/ri';
import AnalysisArea from './AnalysisArea';
import { connect } from 'react-redux';
import {
  uploadFiles,
  setCurrentDirectory,
  setGameRefLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setLoader,
  setUserUploads,
} from '../../actions/board';
import VideosArea from './VideosArea';
import UploadsLimitModal from './UploadsLimitModal';
import { FaVideo } from 'react-icons/fa';
import MultiTabNotations from './MultiTabNotations';

const SYMBOL_MODE_LS_OPTION = 'dashboard:symbolMode';
const ACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-active.svg');
const INACTIVE_NOTATION = require('../../../public/assets/images/pgn-viewer/notation-inactive.svg');
const ACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-active.svg');
const INACTIVE_REFERENCE = require('../../../public/assets/images/pgn-viewer/reference-inactive.svg');

const mapStateToProps = (state) => {
  return {
    variationOpt: state.board.variationOpt,
    pgnStr: state.board.pgnStr,
    userFullInfo: state.cloud.userFullInfo,
    activeFileInfo: state.board.activeFileInfo,
    fen: state.board.fen,
    searchParams: state.board.searchParams,
    uploadFilterByPos: state.board.uploadFilterByPos,
    loader: state.board.loader,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
  };
};

const MobilePGNViewer = (props) => {
  const {
    variationOpt,
    activeFileInfo,
    pgnStr,
    userFullInfo,
    handleAnalyze,
    fenToAnalyze,
    setFenToAnalyze,
    uploadFiles,
    setCurrentDirectory,
    activeTab,
    setActiveTab,
    fen,
    setGameRefLoader,
    setGameReference,
    setMoveLoader,
    setReference,
    setLoader,
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
    if (!loader.length && createFolderModal) {
      setCreateFolderModal(false);
    }
  }, [loader]);

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
    <div className="mb-pgn-viewer">
      <div className="pgn-viewer-body">
        {analyzingFenTabIndx === null ||
        analyzingFenTabIndx === activePgnTab ? (
          <>
            <AnalysisArea
              handleAnalyze={handleAnalyze}
              fenToAnalyze={fenToAnalyze}
              setFenToAnalyze={setFenToAnalyze}
            />
            <div>
              <MobileEnginesList
                handleAnalyze={handleAnalyze}
                fenToAnalyze={fenToAnalyze}
                setFenToAnalyze={setFenToAnalyze}
              />
            </div>
          </>
        ) : (
          <></>
        )}

        <div className="toggle-btn ml-3 mt-4">
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
        <div className="mb-pgn-wrapper">
          <div className="pgn-regulation">
            <div className="pgn-viewer-header mt-4">
              <TabList className="tab-style-mb">
                <div className="d-flex flex-row">
                  <Tab onClick={() => setActiveTab(0)}>
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
                  <Tab
                    className="uploads-tab"
                    onClick={() => {
                      setActiveTab(2);
                    }}
                  >
                    <div id="uploadsTab">
                      <IoMdFolder
                        height={15}
                        width={15}
                        className="uploads"
                        style={{
                          color: activeTab === 2 ? '#358C65' : '#959D99',
                        }}
                      />
                      <span
                        style={{
                          color: activeTab === 2 ? '#358C65' : '#959D99',
                        }}
                      >
                        Uploads
                      </span>
                    </div>
                  </Tab>
                  <Tab
                    className="uploads-tab"
                    onClick={() => {
                      setActiveTab(3);
                    }}
                  >
                    <FaVideo
                      height={15}
                      width={15}
                      className="uploads"
                      style={{ color: activeTab === 3 ? '#358C65' : '#959D99' }}
                    />
                    <span
                      style={{ color: activeTab === 3 ? '#358C65' : '#959D99' }}
                    >
                      Video Search
                    </span>
                  </Tab>
                </div>
              </TabList>
            </div>
          </div>
          <Tabs
            selectedIndex={activeTab}
            onSelect={(index) => setActiveTab(index)}
          >
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
                  />
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
          {variationOpt ? (
            <VariationOptionsModal isOpen={variationOpt} />
          ) : (
            <></>
          )}
        </div>
        <div>
          <VariationActions />
        </div>
      </div>
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
  setGameRefLoader,
  setGameReference,
  setMoveLoader,
  setReference,
  setLoader,
  setUserUploads,
})(withOrientationChange(MobilePGNViewer));
