import React, { useState } from 'react';
import { ImFolderPlus, ImFolderUpload } from 'react-icons/im';
import {
  RiFileUploadFill,
  RiArrowLeftLine,
  RiDeleteBinFill,
} from 'react-icons/ri';
import { MdOutlineDriveFileRenameOutline, MdOutlineSort } from 'react-icons/md';
import DeleteFilesModal from './DeleteFilesModal';
import {
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  createFolder,
  deleteFiles,
  setUploadFilterByPos,
  setUserUploads,
} from '../../actions/board';
import { connect } from 'react-redux';
import EditFolderNameModal from './EditFolderNameModal';
import { INITIAL_FEN } from '../../constants/board-params';

const mapStateToProps = (state) => {
  return {
    userUploads: state.board.userUploads,
    currentDirectory: state.board.currentDirectory,
    uploadFilterByPos: state.board.uploadFilterByPos,
    fen: state.board.fen,
    tourType: state.board.tourType,
    tourStepNumber: state.board.tourStepNumber,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const UploadsNav = ({
  currentDirectory,
  setCurrentDirectory,
  selectedFiles,
  setSelectedFiles,
  uploadFiles,
  setLoader,
  createFolder,
  deleteFiles,
  userInfo,
  uploadFilterByPos,
  setUploadFilterByPos,
  setCreateFolderModal,
  tourType,
  tourStepNumber,
  deleteModal,
  setDeleteModal,
  editFolder,
  setEditFolder,
  setSortByName,
  isGuestUser,
  setLoginModal,
}) => {
  const [uploadTourLoader, setUploadTourLoader] = useState(false);

  const createNewFolderHandler = () => {
    setCreateFolderModal(true);
  };

  const readFiles = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const uploadFilesHandler = async (files, directory) => {
    const path = '/' + directory + '/';
    setLoader('fileLoader');
    if (tourType === 'analyze' && tourStepNumber === 4) {
      setUploadTourLoader(true);
    }
    let transfer = new DataTransfer();
    let headers = {};

    for (let i = 0; i < files.length; i++) {
      let fileText = await readFiles(files[i]);
      if (
        fileText.includes('[Event ') &&
        fileText.match(/\[Event /g).length > 1
      ) {
        fileText = fileText.split('[Event ');
        let initalName = files[i].name;
        for (let i = 0; i < fileText.length; i++) {
          if (fileText[i].length) {
            let pgnStr = '[Event ' + fileText[i];
            let finalName = i + '-' + initalName;
            if (!pgnStr.length || pgnStr === ' *') {
              pgnStr = `[SetUp "1"]\n[FEN "${INITIAL_FEN}"]\n\n*`;
            }
            let file = new File([pgnStr], finalName, {
              type: 'application/vnd.chess-pgn',
            });
            transfer.items.add(file);
          }
        }
      } else {
        if (!fileText.length || fileText === ' *') {
          fileText = `[SetUp "1"]\n[FEN "${INITIAL_FEN}"]\n\n*`;
        }
        let file = new File([fileText], files[i].name, {
          type: 'application/vnd.chess-pgn',
        });
        transfer.items.add(file);
      }
    }
    let transferFiles = transfer.files;
    return uploadFiles(path, transferFiles, userInfo);
  };

  const uploadFolderHandler = (e) => {
    if (isGuestUser) {
      setLoginModal(true);
      return;
    }
    const files = e.target.files;
    const path = files[0].webkitRelativePath.split('/')[0];
    setLoader('folderLoader');
    createFolder('/', path, userInfo).then(() => {
      setLoader('');
      uploadFilesHandler(files, path);
    });
  };

  const deleteFilesHandler = () => {
    setDeleteModal(true);
  };

  const backFromDirectoryHandler = () => {
    setCurrentDirectory('/');
  };

  const renameFolderHandler = () => {
    setEditFolder(true);
  };

  return (
    <div className="upload-nav directory">
      <div>
        {currentDirectory !== '/' ? (
          <RiArrowLeftLine
            className="upload-nav-icon"
            onClick={() => backFromDirectoryHandler()}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="d-flex flex-row">
        <div className="upload-nav-operatons">
          {selectedFiles && selectedFiles.length === 1 ? (
            <MdOutlineDriveFileRenameOutline
              className="upload-nav-icon directory"
              width={40}
              height={40}
              title="Rename Folder"
              onClick={renameFolderHandler}
            />
          ) : (
            <></>
          )}
          {selectedFiles && selectedFiles.length ? (
            <RiDeleteBinFill
              className="upload-nav-icon directory"
              width={35}
              height={35}
              onClick={deleteFilesHandler}
              title="Delete Folder"
            />
          ) : (
            <></>
          )}
          {currentDirectory !== '/' ? (
            <>
              <label htmlFor="upload-file">
                {uploadTourLoader ? (
                  <div className="circle-loader"></div>
                ) : (
                  <RiFileUploadFill
                    id="uploadFile"
                    className="upload-nav-icon upload-file"
                    title="Upload File"
                  />
                )}
              </label>
              <input
                id="upload-file"
                type="file"
                accept=".pgn"
                multiple
                onChange={(e) =>
                  uploadFilesHandler(e.target.files, currentDirectory)
                }
                onClick={(e) => {
                  e.target.value = null;
                }}
                hidden
              />
            </>
          ) : (
            <>
              <ImFolderPlus
                id="createFolder"
                className="upload-nav-icon"
                title="New Folder"
                onClick={createNewFolderHandler}
              />
              <label htmlFor="upload-folder">
                <ImFolderUpload
                  className="upload-nav-icon"
                  title="Upload Folder"
                />
              </label>
              <input
                id="upload-folder"
                type="file"
                directory=""
                webkitdirectory=""
                mozdirectory=""
                hidden
                onChange={(e) => {
                  uploadFolderHandler(e);
                }}
              />
            </>
          )}
          <MdOutlineSort
            className="upload-nav-icon directory"
            width={40}
            height={40}
            title="Sort by Name"
            onClick={() => {
              setSortByName((sortByName) => !sortByName);
            }}
          />
        </div>
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
      <DeleteFilesModal
        isOpen={deleteModal}
        setIsOpen={setDeleteModal}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        deleteFiles={deleteFiles}
        userInfo={userInfo}
        setLoader={setLoader}
      />
      <EditFolderNameModal
        selectedFiles={selectedFiles}
        isOpen={editFolder}
        setIsOpen={setEditFolder}
      />
    </div>
  );
};

export default connect(mapStateToProps, {
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  createFolder,
  deleteFiles,
  setUploadFilterByPos,
  setUserUploads,
})(UploadsNav);
