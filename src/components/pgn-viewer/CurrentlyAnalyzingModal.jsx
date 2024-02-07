import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { getUserServersInfo, setSubModal } from '../../actions/cloud';
import { connect } from 'react-redux';



const CurrentlyAnalyzingModal = (
  { showModal,
    setShowModal,
    setSubModal,
    bringServersSocketData,
    setIsFocus,
  }) => {
  const [isLoading, setIsLoading] = useState(false);


  const handleBringAnalyzer = () => {
    setIsLoading(true);
    if (bringServersSocketData) {
      bringServersSocketData.send(JSON.stringify({ bring_called: true }))
      setSubModal("currently_analyzing")
      setIsFocus(true);
      setIsLoading(false);
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setSubModal('');
  };


  return (
    <Modal
      show={showModal}
      keyboard={false}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="d-flex flex-row justify-content-end mt-2">
          <button
            className="modal-close"
            type="button"
            onClick={handleCloseModal}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="30"
              height="30"
              alt=""
            />
          </button>
        </div>
        <div className="extend-survay-info d-flex flex-column">
          <p>
            <span className='align-self-center modal-text'>Please stop all active engines in other tabs to start your analysis here.🐱:</span>
          </p>
          <div className='button-wrapper d-flex'>
            <button
              className="bring_hera_btn"
              onClick={handleBringAnalyzer}
            >
              {isLoading ? (
                <div className="circle-loader"></div>
              ) : (
                'Stop & Bring Analysis Here'
              )}
            </button>
            <button
              className="cancel_btn"
              onClick={handleCloseModal}
            >
              {isLoading ? (
                <div className="circle-loader"></div>
              ) : (
                'Cancel'
              )}
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(null, {
  getUserServersInfo,
  setSubModal,
})(CurrentlyAnalyzingModal);
