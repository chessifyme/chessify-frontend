import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { uploadFiles } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    userFullInfo: state.cloud.userFullInfo,
    allPgnArr: state.board.allPgnArr,
    pgnStr: state.board.pgnStr,
    activePgnTab: state.board.activePgnTab,
  };
};

const UploadsSavingModal = ({
  isOpen,
  setIsOpen,
  closeFileTabInx,
  setCloseFileTabInx,
  allPgnArr,
  closeTab,
  uploadFiles,
  userFullInfo,
  pgnStr,
  activePgnTab,
}) => {
  const closeModalHandler = () => {
    setIsOpen(false);
  };

  const closeWithoutSavingHandler = () => {
    closeTab(closeFileTabInx);
    setCloseFileTabInx(-1);
    closeModalHandler();
  };

  const saveAndCloseHandler = () => {
    let currentPgnStr = allPgnArr[closeFileTabInx].tabPgnStr;
    if (closeFileTabInx === activePgnTab) {
      currentPgnStr = pgnStr;
    }
    const fileName = allPgnArr[closeFileTabInx].tabFile.key.split('/')[2];
    const path =
      '/' + allPgnArr[closeFileTabInx].tabFile.key.split('/')[1] + '/';

    let file = new File([currentPgnStr], fileName, {
      type: 'application/vnd.chess-pgn',
    });

    let transfer = new DataTransfer();
    transfer.items.add(file);
    let fileList = transfer.files;

    uploadFiles(path, fileList, userFullInfo).then(() => {
      closeWithoutSavingHandler();
    });
  };

  const cancelHandler = () => {
    setCloseFileTabInx(-1);
    closeModalHandler();
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
      <Modal.Body className="save-affirmation-modal">
        <p>
          Save the changes in{' '}
          {allPgnArr[closeFileTabInx] &&
            allPgnArr[closeFileTabInx].tabFile &&
            allPgnArr[closeFileTabInx].tabFile.key &&
            allPgnArr[closeFileTabInx].tabFile.key.split('/')[1] +
              '/' +
              allPgnArr[closeFileTabInx].tabFile.key.split('/')[2]}{' '}
          before closing it?
        </p>
        <div className="d-flex flex-row justify-content-center">
          <Button
            className="game-format-btn game-format-close-btn"
            onClick={() => {
              cancelHandler();
            }}
          >
            Cancel
          </Button>
          <Button
            className="game-format-btn game-format-close-btn"
            onClick={() => {
              closeWithoutSavingHandler();
            }}
          >
            Close
          </Button>
          <Button
            className="apply-btn directory"
            onClick={() => {
              saveAndCloseHandler();
            }}
          >
            Save and Close
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  uploadFiles,
})(UploadsSavingModal);
