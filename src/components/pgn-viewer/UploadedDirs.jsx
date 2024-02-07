import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import Table from 'react-bootstrap/Table';
import { RiDeleteBinFill } from 'react-icons/ri';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { setCurrentDirectory, setTourNextStep } from '../../actions/board';
import useKeyPress from './KeyPress';

const FOLDER_STYLE = require('../../../public/assets/images/pgn-viewer/folder-style.svg');

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
  setDeleteModal,
  setEditFolder,
  sortByName,
}) => {
  const enterPressed = useKeyPress(13);

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

  useEffect(() => {
    if (!enterPressed && selectedFiles.length === 1) {
      setCurrentDirectory(selectedFiles[0]);
      setSelectedFiles([]);
      return;
    }
  }, [enterPressed]);

  let userUploadedFilesCurr = userUploadedFiles;

  if (sortByName) {
    let collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    userUploadedFilesCurr = Object.keys(userUploadedFiles)
      .sort(function (a, b) {
        let x = a.toLowerCase();
        let y = b.toLowerCase();

        if (x > y) {
          return 1;
        }
        if (x < y) {
          return -1;
        }
        return 0;
      })
      .sort(collator.compare)
      .reduce((obj, key) => {
        obj[key] = userUploadedFiles[key];
        return obj;
      }, {});
  }

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
      <Table className="folders-container" hover>
        <tbody className="container-folder-body">
          {loader !== 'folderLoader' && userUploadedFilesCurr ? (
            Object.keys(userUploadedFilesCurr).map((folder, index) => {
              if(tourType === 'analyze' && tourStepNumber === 2){
                 setTourNextStep();
                 }
              return (
                <tr
                  key={folder + Math.random()}
                  onClick={(event) => openFolderHandler(event, folder)}
                >
                  <td
                    className={`folder-btn ${
                      selectedFiles.includes(folder) ? 'active-folder-span' : ''
                    }`}
                  >
                    <div id="folderContainer">
                      <span>{index + 1}.</span>
                      <img src={FOLDER_STYLE} width={25} alt="" />
                      <span>{folder}</span>
                    </div>
                    <div className="right-section">
                      <span>{userUploadedFilesCurr[folder].length} files</span>
                      <MdOutlineDriveFileRenameOutline
                        className="upload-nav-icon directory"
                        title="Rename Folder"
                        onClick={() => {
                          setSelectedFiles([folder]);
                          setEditFolder(true);
                        }}
                      />
                      <RiDeleteBinFill
                        className="upload-nav-icon directory"
                        onClick={() => {
                          setSelectedFiles([folder]);
                          setDeleteModal(true);
                        }}
                        title="Delete Folder"
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default connect(mapStateToProps, {
  setCurrentDirectory,
  setTourNextStep,
})(UploadedDirs);
