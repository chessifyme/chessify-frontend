import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteFilesModal = ({
  isOpen,
  setIsOpen,
  selectedFiles,
  setSelectedFiles,
  deleteFiles,
  isFile,
  userFullInfo,
  setLoader,
}) => {
  const closeModalHandler = () => {
    setSelectedFiles([]);
    setIsOpen(false);
  };

  const deleteFilesHandler = () => {
    setIsOpen(false);
    if (!isFile) {
      setLoader('folderLoader');
      deleteFiles([], selectedFiles, userFullInfo).then(() => {
        setLoader('');
      });
    } else {
      setLoader('fileLoader');
      deleteFiles(selectedFiles, [], userFullInfo).then(() => {
        setLoader('');
      });
    }
    setSelectedFiles([]);
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
        <div className="directory delete-text">
          {selectedFiles && selectedFiles.length > 1 ? (
            <h4>
              Are you sure you want to delete the {selectedFiles.length} seleted
              items?
            </h4>
          ) : (
            <h4>Are you sure you want to delete {selectedFiles[0]}?</h4>
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
            className="apply-btn directory"
            variant="primary"
            type="button"
            onClick={deleteFilesHandler}
          >
            Delete
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteFilesModal;
