import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { setCurrentDirectory, setTourNextStep } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userUploads: state.board.userUploads,
    loader: state.board.loader,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
  };
};

const UploadedDirs = ({
  userUploadedFiles,
  loader,
  setCurrentDirectory,
  selectedFiles,
  setSelectedFiles,
  tourStepNumber,
  tourType,
  setTourNextStep,
}) => {
  const openFolderHandler = (event, folder) => {
    if (event.ctrlKey || event.metakey) {
      if (selectedFiles.includes(folder)) {
        const index = selectedFiles.indexOf(folder);
        if (index !== -1) {
          selectedFiles.splice(index, 1);
        }
        setSelectedFiles([...selectedFiles]);
        return;
      }
      setSelectedFiles([...selectedFiles, folder]);
      return;
    }
    if (event.detail >= 2) {
      setCurrentDirectory(folder);
      setSelectedFiles([]);
      if (tourType === 'analyze' && tourStepNumber === 3) {
        setTourNextStep();
      }
      return;
    }
    setSelectedFiles([folder]);
  };

  return (
    <>
      {loader === 'folderLoader' ? (
        <div className="isLoading isLoading-folder d-flex flex-row justify-content-center">
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
        <></>
      )}
      <div id='folderContainer' className="folders-container">
        {loader !== 'folderLoader' && userUploadedFiles ? (
          Object.keys(userUploadedFiles).map((folder, index) => {
            return (
              <button
                key={folder + Math.random()}
                className="folder-btn directory"
                onClick={(event) => openFolderHandler(event, folder)}
              >
                <span className="directory d-flex flex-column">
                  <img
                    className={`directory ${
                      selectedFiles.includes(folder) ? 'active-folder' : ''
                    }`}
                    src={require('../../../public/assets/images/pgn-viewer/folder-style.svg')}
                    width={72}
                    height={72}
                    alt=""
                  />
                  <span className="directory">{folder}</span>
                </span>
              </button>
            );
          })
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default connect(mapStateToProps, {
  setCurrentDirectory,
  setTourNextStep,
})(UploadedDirs);
