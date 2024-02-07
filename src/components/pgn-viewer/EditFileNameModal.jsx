import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { setLoader, editFileName } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userInfo: state.cloud.userInfo,
    currentDirectory: state.board.currentDirectory,
    userUploads: state.board.userUploads,
  };
};

const EditFileNameModal = ({
  isOpen,
  setIsOpen,
  setLoader,
  userInfo,
  userUploads,
  selectedFile,
  editFileName,
  currentDirectory,
}) => {
  const [newFileName, setNewFileName] = useState('');
  const [createFIleLoader, setCreateFileLoader] = useState(false);
  const [newFileNameError, setNewFileNameError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewFileName(selectedFile.key.split('/')[2].replace('.pgn', ''));
    }
  }, [isOpen]);

  const closeModalHandler = () => {
    setNewFileName('');
    setIsOpen(false);
    setCreateFileLoader(false);
    setNewFileNameError('');
  };

  const editFileNameHandler = () => {
    if (!newFileName || (newFileName && !newFileName.length)) {
      setNewFileNameError('File name cannot be empty.');
      return;
    } else if (
      userUploads[currentDirectory].some(
        (file) => file.key.split('/')[2] === newFileName
      )
    ) {
      setNewFileNameError('The file name already exists.');
      return;
    }
    setCreateFileLoader(true);
    setLoader('fileLoader');
    editFileName(selectedFile.id, newFileName, userInfo);
    closeModalHandler();
  };

  useEffect(() => {
    setNewFileNameError('');
  }, [newFileName]);

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
            <h4 className="new-folder">Edit File Name</h4>
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
              editFileNameHandler();
            }}
          >
            <div className="form-group">
              <input
                className="folder-name-input"
                type="text"
                name="folder_name_input"
                value={newFileName}
                autoFocus
                onChange={(e) => setNewFileName(e.target.value)}
              />
              {newFileNameError.length ? (
                <div className="error-message" style={{ color: '#c33' }}>
                  {newFileNameError}
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
                {createFIleLoader ? (
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
  editFileName,
})(EditFileNameModal);
