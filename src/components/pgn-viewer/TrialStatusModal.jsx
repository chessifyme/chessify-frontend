import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import ReactPlayer from 'react-player';

const TrialStatusModal = ({ showModal, setShowModal }) => {
  const [playVideo, setPlayVideo] = useState(false);
  const [modalSize, setModalSize] = useState('md');
  const handleCloseModal = () => {
    setShowModal(false);
    window.history.replaceState(null, '', '/analysis');
  };
  const today = new Date();
  const twoDaysLater = new Date(today);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  twoDaysLater.setDate(twoDaysLater.getDate() + 2);

  const playVideoHandler = () => {
    !playVideo ? setModalSize('lg') : setModalSize('md');
    setPlayVideo(!playVideo);
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      keyboard={false}
      size={modalSize}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="text-center trial-status">
          <h2>Your Free Trial Is On!</h2>
          <h3>
            Until {monthNames[twoDaysLater.getMonth()]} {twoDaysLater.getDate()}, you will
            have free access to all our features.
          </h3>
          <p className="text-center">
            Learn how to use the platform with the short demo video.
          </p>
          <div className="d-flex flex-row justify-content-center mb-3">
            <button className="apply-btn" onClick={() => playVideoHandler()}>
              Watch Demo
            </button>
          </div>
          <div className="d-flex flex-row justify-content-center">
            {playVideo && (
              <ReactPlayer
                url={'https://www.youtube.com/embed/eedQWmlRnPY'}
                playing={true}
                width={660}
                height={415}
              />
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default TrialStatusModal;
