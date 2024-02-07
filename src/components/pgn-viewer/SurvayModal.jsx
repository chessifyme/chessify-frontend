import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

const SurvayModal = ({ showModal, setShowModal, setSubModal }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setSubModal('');
  
  };
  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
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
        <div className="extend-survay-title">
          <video muted autoPlay loop="true">
            <source src={require('../../../public/assets/video/feedback.mp4')} type="video/mp4" ></source>
          </video>
        </div>
        <div className="extend-survay-info">
          <p className='d-flex flex-column'>
            <span className='align-self-center'>Don't ignore those pleading eyes 🐱:</span> 
            <span className='align-self-center'>Take a moment for our survey! </span>
          </p>  
          <div>
            <a
              id="sur-id"
              className="extend-survay-btn"
              href="https://docs.google.com/forms/d/e/1FAIpQLSeSCpYV5C9H9jHFm0VWYOL6nphEFhm1odVOKCvEcRGWXbnzEA/viewform"
              target="_blank"
              rel="noopener noreferrer"
              onClick={()=>{
               setIsLoading(true)
               setShowModal(false)
              }
              }
           >
              Start Now{' '}
              {isLoading ? <div className="circle-loader"></div> : <></>}
            </a>
          </div>
        </div>  
      </Modal.Body>
    </Modal>
  );
};

export default SurvayModal;
