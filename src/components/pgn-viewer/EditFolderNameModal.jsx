import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { setLoader, editFolderName } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userInfo: state.cloud.userInfo,
    userUploads: state.board.userUploads,
  };
};

const EditFolderNameModal = ({
  isOpen,
  setIsOpen,
  setLoader,
  userInfo,
  userUploads,
  selectedFiles,
  editFolderName,
}) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [oldName, setOldName] = useState('');
  const [createFolderLoader, setCreateFolderLoader] = useState(false);
  const [newFolderNameError, setNewFolderNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewFolderName(selectedFiles[0]);
      setOldName(selectedFiles[0]);
    }
  }, [isOpen]);

  const closeModalHandler = () => {
    setNewFolderName('');
    setIsOpen(false);
    setCreateFolderLoader(false);
    setNewFolderNameError('');
    setOldName('');
  };

  const editFolderNameHandler = () => {
    if (!newFolderName || (newFolderName && !newFolderName.length)) {
      setNewFolderNameError('Folder name cannot be empty.');
      return;
    } else if (Object.keys(userUploads).includes(newFolderName)) {
      setNewFolderNameError('The folder name already exists.');
      return;
    }
    setCreateFolderLoader(true);
    setLoader('folderLoader');
    editFolderName(oldName, newFolderName, userInfo);
    closeModalHandler();
  };

  useEffect(() => {
    setNewFolderNameError('');
  }, [newFolderName]);

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
      <Modal.Body>
        <div>
          <div className="d-flex flex-row justify-content-between">
            <h4 className="new-folder">Edit Folder Name</h4>
            <button
              className="modal-close"
              type="button"
              onClick={() => {
                closeModalHandler();
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
              editFolderNameHandler();
            }}
          >
            <div className="form-group">
              <input
                className="folder-name-input"
                type="text"
                name="folder_name_input"
                value={newFolderName}
                autoFocus
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              {newFolderNameError.length ? (
                <div className="error-message" style={{ color: '#c33' }}>
                  {newFolderNameError}
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
                  'Save'
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
  editFolderName,
})(EditFolderNameModal);
