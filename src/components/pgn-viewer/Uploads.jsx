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
    userFullInfo: state.cloud.userFullInfo,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
  };
};

const Uploads = ({
  userUploads,
  uploadProgress,
  setUserUploads,
  currentDirectory,
  loader,
  userFullInfo,
  setActiveTab,
  setLoader,
  tourStepNumber,
  tourType,
  setTourNextStep,
  setCreateFolderModal,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);

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
      setUserUploads('/', userFullInfo);
    }
    return () => {
      isMounted = false;
    };
  }, [userUploads]);

  useEffect(() => {
    console.log('DIRECTORY CHANGED');
  }, [currentDirectory]);

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
      {loader === 'initalLoad' ? (
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
            userFullInfo={userFullInfo}
            setCreateFolderModal={setCreateFolderModal}
          />
          {userUploads &&
          userUploads.hasOwnProperty('noExistingFilesErrorMessage') ? (
            <div className="no-uploads">
              {userUploads.noExistingFilesErrorMessage}
            </div>
          ) : currentDirectory === '/' ? (
            <UploadedDirs
              userUploadedFiles={userUploads}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
            />
          ) : (
            <UploadedFiles
              userUploadedFiles={userUploads}
              userFullInfo={userFullInfo}
              setActiveTab={setActiveTab}
              uploadProgress={uploadProgress}
              tourType={tourType}
              tourStepNumber={tourStepNumber}
              setTourNextStep={setTourNextStep}
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
