import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import Table from 'react-bootstrap/Table';
import { Modal, Button } from 'react-bootstrap';
import { generateFileName, settingHeader } from '../../utils/chess-utils';
import {
  uploadFiles,
  createFolder,
  setActiveFile,
  setCurrentDirectory,
  setPgn,
  setUploadFilterByPos,
} from '../../actions/board';
import { generateNewFolderName } from '../../../src/utils/pgn-viewer';

const mapStateToProps = (state) => {
  return {
    userUploads: state.board.userUploads,
    pgnStr: state.board.pgnStr,
    userInfo: state.cloud.userInfo,
    uploadLimitExceeded: state.board.uploadLimitExceeded,
    uploadFilterByPos: state.board.uploadFilterByPos,
  };
};

const FOLDER_STYLE = require('../../../public/assets/images/pgn-viewer/folder-style.svg');
const FOLDER_STYLE_ACTIVE = require('../../../public/assets/images/pgn-viewer/folder-style-active.svg');

const SavePgnUploadModal = ({
  pgnStr,
  userUploads,
  isOpen,
  setIsOpen,
  uploadFiles,
  userInfo,
  newFolderName,
  setNewFolderName,
  createFolder,
  setActiveFile,
  setCurrentDirectory,
  uploadLimitExceeded,
  setPgn,
  uploadFilterByPos,
  setUploadFilterByPos,
  goToNextGame,
  saveIndent,
  changeRefIndx,
}) => {
  const [disableBtn, setDisableBtn] = useState(true);
  const [fileName, setFileName] = useState(generateFileName());
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolder, setNewFolder] = useState(false);

  const [newFolderNameActive, setNewFolderNameActive] = useState(false);
  const [loader, setLoader] = useState(false);

  const refInput = useRef(null);

  useEffect(() => {
    if (selectedFolder.length && fileName.length) {
      setDisableBtn(false);
    } else {
      setDisableBtn(true);
    }
  });

  useEffect(() => {
    if (newFolderNameActive) {
      refInput.current && refInput.current.focus();
    }
  }, [newFolderNameActive]);

  useEffect(() => {
    if (
      userUploads &&
      userUploads.hasOwnProperty('noExistingFilesErrorMessage')
    ) {
      setNewFolder(true);
      const name = generateNewFolderName(userUploads, 'New Folder');
      setNewFolderName(name);
      setNewFolderNameActive(true);
      setSelectedFolder(name);
    }
  }, [userUploads]);

  const handleClickOutside = (event) => {
    if (refInput.current && !refInput.current.contains(event.target)) {
      if (!newFolderName.length) {
        setNewFolder(false);
        setNewFolderName(generateNewFolderName(userUploads, 'New Folder'));
        setNewFolderNameActive(true);
      } else {
        saveFolderHandler();
      }
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

  const closeModalHandler = () => {
    setIsOpen(false);
    setDisableBtn(true);
    setNewFolder(false);
    setNewFolderNameActive(false);
    setLoader(false);
    setSelectedFolder('');
    setFileName(generateFileName());
    setNewFolderName(generateNewFolderName(userUploads, 'New Folder'));
  };

  const savePgnHandler = () => {
    setLoader(true);
    pgnStr = settingHeader(pgnStr);
    let finalName = fileName + '.pgn';
    let file = new File([pgnStr], finalName, {
      type: 'application/vnd.chess-pgn',
    });

    let transfer = new DataTransfer();
    transfer.items.add(file);
    let fileList = transfer.files;

    if (newFolderName !== selectedFolder) {
      const path = '/' + selectedFolder + '/';
      uploadFiles(path, fileList, userInfo).then((response) => {
        setCurrentDirectory(selectedFolder);
        if (!uploadLimitExceeded && !goToNextGame) {
          setActiveFile(pgnStr, { key: path + finalName }, selectedFolder);
          setPgn(pgnStr);
        }
        setLoader(false);
        closeModalHandler();
      });
    } else {
      createFolder('/', selectedFolder, userInfo).then(() => {
        const path = '/' + selectedFolder + '/';
        uploadFiles(path, fileList, userInfo).then((response) => {
          const path = '/' + selectedFolder + '/';
          setCurrentDirectory(selectedFolder);
          if (!uploadLimitExceeded && !goToNextGame) {
            setActiveFile(pgnStr, { key: path + finalName }, selectedFolder);
            setPgn(pgnStr);
          }
          setLoader(false);
          closeModalHandler();
        });
      });
    }
    if (goToNextGame) {
      changeRefIndx(saveIndent);
    }
  };

  const changeNameHandler = (event) => {
    if (event.detail === 2) {
      setNewFolderNameActive(true);
    }
  };

  const saveFolderHandler = () => {
    setNewFolderNameActive(false);
    let newFolderNameTrimmed = newFolderName.trim();
    let generatedName = generateNewFolderName(
      userUploads,
      newFolderNameTrimmed
    );
    if (generatedName === newFolderNameTrimmed) {
      setNewFolderName(newFolderNameTrimmed);
      setSelectedFolder(newFolderNameTrimmed);
    } else {
      setNewFolderName(generatedName);
      setSelectedFolder(generatedName);
    }
  };

  return (
    <Modal
      size="md"
      show={isOpen}
      onHide={closeModalHandler}
      keyboard={true}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="d-flex flex-row justify-content-between">
          <h3 className="game-format-title">Save PGN in Cloud</h3>
          <button
            className="modal-close"
            type="button"
            onClick={closeModalHandler}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="30"
              height="30"
              alt=""
            />
          </button>
        </div>
        <div>
          <h6 className="save-info-title">Save as:</h6>
          <input
            className="upload-pgn-inputName mt-3"
            value={fileName}
            autoFocus
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>
        <div className="mb-3 mt-4">
          <div className="d-flex flex-row justify-content-between">
            <h6 className="save-info-title">Save in:</h6>
            <div>
              <select
                value={uploadFilterByPos ? 'position' : 'all'}
                className="uploads-filter-opt"
                onChange={(e) => {
                  setUploadFilterByPos(e.target.value);
                }}
              >
                <option value="all">All Files</option>
                <option value="position">By Position</option>
              </select>
            </div>
          </div>
          <Table className="folders-container" hover>
            <tbody className="container-folder-body">
              {userUploads &&
              !userUploads.hasOwnProperty('noExistingFilesErrorMessage') ? (
                Object.keys(userUploads).map((folder, index) => {
                  return (
                    <tr
                      key={folder + Math.random() * index}
                      className="folder-btn directory"
                      onClick={() => {
                        setSelectedFolder(folder);
                      }}
                    >
                      <td className="folder-btn">
                        <div id="folderContainer">
                          <span>{index + 1}.</span>
                          <img
                            src={
                              selectedFolder === folder
                                ? FOLDER_STYLE_ACTIVE
                                : FOLDER_STYLE
                            }
                            width={25}
                            alt=""
                          />
                          <span>{folder}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <></>
              )}
              <tr className="folder-btn directory">
                {!newFolder ? (
                  <td
                    className="folder-btn"
                    onClick={() => {
                      setNewFolder(true);
                      setNewFolderNameActive(true);
                      setSelectedFolder(newFolderName);
                    }}
                  >
                    <div id="folderContainer" style={{ margin: '0 auto' }}>
                      <span className="add-new-folder-icon">
                        Create new folder
                      </span>
                    </div>
                  </td>
                ) : (
                  <td
                    className="folder-btn"
                    onClick={() => {
                      setSelectedFolder(newFolderName);
                    }}
                  >
                    <div id="folderContainer">
                      <span>{Object.keys(userUploads).length + 1}.</span>
                      <img
                        src={
                          selectedFolder === newFolderName
                            ? FOLDER_STYLE_ACTIVE
                            : FOLDER_STYLE
                        }
                        width={25}
                        alt=""
                      />
                      <span className="directory">
                        {newFolderNameActive ? (
                          <input
                            active
                            value={newFolderName}
                            ref={refInput}
                            className="new-folder-inp"
                            onChange={(e) => {
                              setNewFolderName(e.target.value);
                              setSelectedFolder(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              e.key === 'Enter' && saveFolderHandler();
                            }}
                          />
                        ) : (
                          <span
                            onClick={(e) => {
                              changeNameHandler(e);
                            }}
                            title="Double click to change name"
                          >
                            {newFolderName}
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                )}
              </tr>
            </tbody>
          </Table>
          <div className="folders-container-upload"></div>
        </div>
        <div className="d-flex flex-row justify-content-between">
          <Button
            className="game-format-btn game-format-close-btn"
            variant="primary"
            onClick={closeModalHandler}
          >
            Cancel
          </Button>
          <Button
            className="apply-btn"
            variant="primary"
            disabled={disableBtn}
            onClick={() => {
              savePgnHandler();
            }}
          >
            {loader ? <div className="circle-loader"></div> : <></>}
            Save
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  uploadFiles,
  createFolder,
  setActiveFile,
  setCurrentDirectory,
  setPgn,
  setUploadFilterByPos,
})(SavePgnUploadModal);
