import React, { useState, useEffect } from 'react';
import UploadedDirs from './UploadedDirs';
import UploadsNav from './UploadsNav';
import UploadedFiles from './UploadedFiles';
import { connect } from 'react-redux';
import {
  setLoader,
  setUserUploads,
  setTourNextStep,
} from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userUploads: state.board.userUploads,
    currentDirectory: state.board.currentDirectory,
    loader: state.board.loader,
    userInfo: state.cloud.userInfo,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const Uploads = ({
  userUploads,
  uploadProgress,
  setUserUploads,
  currentDirectory,
  loader,
  userInfo,
  setLoader,
  tourStepNumber,
  tourType,
  setTourNextStep,
  setCreateFolderModal,
  sortByName,
  setSortByName,
  isGuestUser,
  setLoginModal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editFolder, setEditFolder] = useState(false);

  const outsideClickHandler = (event) => {
    if (
      !event.target.classList.contains('directory') &&
      Object.keys(event.target.classList).length !== 0
    ) {
      setSelectedFiles([]);
    }
  };

  useEffect(() => {
    if (selectedFiles.length) {
      const outsideClick = setTimeout(() => {
        document.addEventListener('click', outsideClickHandler);
      }, 500);
      return () => {
        clearTimeout(outsideClick);
        document.removeEventListener('click', outsideClickHandler);
      };
    }
  });

  useEffect(() => {
    if (
      userUploads &&
      Object.keys(userUploads).length === 0 &&
      Object.getPrototypeOf(userUploads) === Object.prototype
    ) {
      setLoader('initalLoad');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (
      userUploads &&
      Object.keys(userUploads).length === 0 &&
      !userUploads.hasOwnProperty('noExistingFilesErrorMessage') &&
      isMounted
    ) {
      setLoader('initalLoad');
      setUserUploads('/', userInfo);
    }
    return () => {
      isMounted = false;
    };
  }, [userUploads]);

  useEffect(() => {}, [currentDirectory]);

  useEffect(() => {
    if (
      tourType === 'analyze' &&
      (tourStepNumber === 0 || tourStepNumber === -1) &&
      loader !== 'initalLoad' &&
      Object.keys(userUploads).length
    ) {
      setTourNextStep();
    }
  }, [loader]);

  return (
    <>
      {loader === 'initalLoad' && !isGuestUser ? (
        <div className="isLoading isLoading-folder isLoading-uploads">
          <div>
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <UploadsNav
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            userInfo={userInfo}
            setCreateFolderModal={setCreateFolderModal}
            deleteModal={deleteModal}
            setDeleteModal={setDeleteModal}
            editFolder={editFolder}
            setEditFolder={setEditFolder}
            setSortByName={setSortByName}
            setLoginModal={setLoginModal}
          />
          {(userUploads &&
            userUploads.hasOwnProperty('noExistingFilesErrorMessage')) ||
          isGuestUser ? (
            <div className="no-uploads">No uploads yet</div>
          ) : currentDirectory === '/' ? (
            <UploadedDirs
              userUploadedFiles={userUploads}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              setDeleteModal={setDeleteModal}
              setEditFolder={setEditFolder}
              sortByName={sortByName}
            />
          ) : (
            <UploadedFiles
              userUploadedFiles={userUploads}
              userInfo={userInfo}
              uploadProgress={uploadProgress}
              tourType={tourType}
              tourStepNumber={tourStepNumber}
              setTourNextStep={setTourNextStep}
              sortByName={sortByName}
            />
          )}
        </>
      )}
    </>
  );
};

export default connect(mapStateToProps, {
  setUserUploads,
  setLoader,
  setTourNextStep,
})(Uploads);
