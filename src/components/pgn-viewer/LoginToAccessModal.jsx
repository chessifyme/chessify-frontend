import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const LoginToAccessModal = ({ isOpen, setIsOpen }) => {
  const closeModalHandler = () => {
    setIsOpen(false);
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
        <div className="d-flex flex-row justify-content-end">
          <button
            className="modal-close modal-close-search"
            type="button"
            onClick={closeModalHandler}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="20"
              height="20"
              alt=""
            />
          </button>
        </div>
        <div className="d-flex flex-row justify-content-center sign-in-text">
          Sign in to use this feature
        </div>
        <div className="d-flex flex-row justify-content-between mt-2">
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
            onClick={() => {
              window.location.href = '/auth/signin';
            }}
          >
            Sign In
          </Button>
        </div>
        <div className="d-flex flex-row justify-content-center mt-3">
          Don't have an account? <a href="/auth/signup" className='ml-1 sign-up-text'>Sign Up</a>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default LoginToAccessModal;
