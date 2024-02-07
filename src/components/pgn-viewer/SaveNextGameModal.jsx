import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    userFullInfo: state.cloud.userFullInfo,
    allPgnArr: state.board.allPgnArr,
    pgnStr: state.board.pgnStr,
    activePgnTab: state.board.activePgnTab,
  };
};

const SaveNextGameModal = ({
  isOpen,
  setIsOpen,
  changeRefIndx,
  saveIndent,
  uploadPgnCloudHandler,
  isLoading,
}) => {
  const closeModalHandler = () => {
    setIsOpen(false);
  };

  const goToNextGameHandler = () => {
    closeModalHandler();
    changeRefIndx(saveIndent);
  };

  const saveGameHandler = () => {
    closeModalHandler();
    uploadPgnCloudHandler();
  };

  const cancelHandler = () => {
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
        <p>Save the changes?</p>
        <div className="d-flex flex-row justify-content-center">
          <Button
            className="game-format-btn game-format-close-btn"
            onClick={() => {
              cancelHandler();
            }}
            disabled={isLoading ? true : false}
          >
            Cancel
          </Button>
          <Button
            className="game-format-btn game-format-close-btn"
            onClick={() => {
              goToNextGameHandler();
            }}
            disabled={isLoading ? true : false}
          >
            Go to {saveIndent === 1 ? 'Next' : 'Previous'}
          </Button>
          <Button
            className="apply-btn directory"
            onClick={() => {
              saveGameHandler();
            }}
            disabled={isLoading ? true : false}
          >
            Save
            {isLoading ? (
              <div
                className="circle-loader"
                style={{ marginLeft: '5px' }}
              ></div>
            ) : (
              ''
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {})(SaveNextGameModal);
