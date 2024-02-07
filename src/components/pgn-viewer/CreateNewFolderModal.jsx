import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  setLoader,
  createFolder,
  setTourNextStep,
  setTourType,
  setTourNumber,
} from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userInfo: state.cloud.userInfo,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
    userUploads: state.board.userUploads,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const CreateNewFolderModal = ({
  isOpen,
  setIsOpen,
  setLoader,
  createFolder,
  userInfo,
  tourType,
  tourStepNumber,
  setTourNextStep,
  setTourType,
  setTourNumber,
  userUploads,
  isGuestUser,
  setLoginModal,
}) => {
  const [folderName, setFolderName] = useState('');
  const [createFolderLoader, setCreateFolderLoader] = useState(false);
  const [folderNameError, setFolderNameError] = useState('');

  useEffect(() => {
    if (isOpen && tourType === 'analyze' && tourStepNumber === 1) {
      setTimeout(setTourNextStep, 300);
    }
  }, [isOpen]);

  const closeModalHandler = () => {
    setFolderName('');
    setIsOpen(false);
    setCreateFolderLoader(false);
    setFolderNameError('');
  };

  const createFolderHandler = () => {
    if (isGuestUser) {
      setLoginModal(true);
      setIsOpen(false);
      return;
    }
    if (!folderName.length) {
      setFolderNameError('Folder name cannot be empty.');
      return;
    } else if (Object.keys(userUploads).includes(folderName)) {
      setFolderNameError('The folder name already exists.');
      return;
    }
    setCreateFolderLoader(true);
    setLoader('folderLoader');
    closeModalHandler();
    createFolder('/', folderName, userInfo);
  };

  useEffect(() => {
    setFolderNameError('');
  }, [folderName]);

  return (
    <Modal
      size="md"
      show={isOpen}
      onHide={closeModalHandler}
      keyboard={true}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body id="folderInputName">
        <div>
          <div className="d-flex flex-row justify-content-between">
            <h4 className="new-folder">New Folder</h4>
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                closeModalHandler();
                if (tourType === 'analyze' && tourStepNumber === 2) {
                  setTourType('');
                  setTourNumber(-1);
                }
              }}
            >
              <img
                src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
                width="30"
                height="30"
                alt=""
              />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createFolderHandler();
            }}
          >
            <div className="form-group">
              <input
                className="folder-name-input"
                type="text"
                name="folder_name_input"
                value={folderName}
                autoFocus
                onChange={(e) => setFolderName(e.target.value)}
              />
              {folderNameError.length ? (
                <div className="error-message" style={{ color: '#c33' }}>
                  {folderNameError}
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="d-flex flex-row justify-content-between">
              <Button
                className="game-format-btn game-format-close-btn"
                variant="primary"
                onClick={() => {
                  closeModalHandler(false);
                  if (tourType === 'analyze' && tourStepNumber === 2) {
                    setTourType('');
                    setTourNumber(-1);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                className="apply-btn create-new-folder"
                variant="primary"
                type="submit"
              >
                {createFolderLoader ? (
                  <div className="circle-loader"></div>
                ) : (
                  'Create'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  setLoader,
  createFolder,
  setTourNextStep,
  setTourType,
  setTourNumber,
})(CreateNewFolderModal);
