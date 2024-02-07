import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const StopAnalysisModal = ({ isOpen, setIsOpen, message }) => {
  return (
    <Modal
      size="sm"
      show={isOpen}
      onHide={() => {
        setIsOpen(false);
      }}
      keyboard={true}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body className="modal-body">
        <div className="d-flex flex-column justify-content-center stop-analysis-warning">
          <p>{message}</p>
          <Button
            className="game-format-btn var-opt-btn"
            variant="primary"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            OK
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default StopAnalysisModal;
