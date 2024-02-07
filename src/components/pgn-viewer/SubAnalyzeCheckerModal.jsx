import React, { useEffect, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { setAnalyzingFenTabIndx } from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
  };
};

function SubAnalyzeCheckerModal({
  fen,
  stop,
  unlimitedNamesArr,
  setAnalyzingFenTabIndx,
}) {
  const [showModal, setShowModal] = useState(false);
  const [showModalTimeout, setShowModalTimeout] = useState(NaN);
  const [stopAnalyzeTimeout, setStopAnalyzeTimeout] = useState(NaN);
  const [isPlaying, setIsPlaying] = useState(false);


  const startModalShowingTimeout = () => {
    if (showModalTimeout) clearTimeout(showModalTimeout);
    const smt = setTimeout(() => {
      setIsPlaying(true)
      setShowModal(true);
    }, 1800000);
    setShowModalTimeout(smt);
  };
  const play = useCallback(() => {
    if (isPlaying) {
      const audio = new Audio(require('../../../public/assets/sounds/audio.wav'))
      audio.play();
    } else {
      return;
    }

  }, [isPlaying])

  const startStopAnalyzeTimeout = () => {
    if (!showModal) return;
    if (stopAnalyzeTimeout) clearTimeout(stopAnalyzeTimeout);
    const sat = setTimeout(() => {
      clearTimeouts();
      stop();
      setAnalyzingFenTabIndx(null);
     }, 60000);
    setStopAnalyzeTimeout(sat);
  };

  const handleCloseModal = () => {
    clearTimeouts();
    startModalShowingTimeout();
  };

  const clearTimeouts = () => {
    clearTimeout(showModalTimeout);
    clearTimeout(stopAnalyzeTimeout);
    setShowModalTimeout(NaN);
    setStopAnalyzeTimeout(NaN);
    setShowModal(false);
    setIsPlaying(false)
  };

  useEffect(startModalShowingTimeout, [fen, unlimitedNamesArr]);

  useEffect(startStopAnalyzeTimeout, [showModal]);
  useEffect(() => {

    play()
  }, [isPlaying]);


  // console.log('MODAL TIMEOUT: ', showModalTimeout);
  // console.log('STOP TIMEOUT: ', stopAnalyzeTimeout);

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
        <div className="analyze-checker">
          <p>In order to continue the analysis press here</p>
          <Button
            className="apply-btn"
            variant="primary"
            onClick={handleCloseModal}
          >
            I'm Here
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default connect(mapStateToProps, { setAnalyzingFenTabIndx })(
  SubAnalyzeCheckerModal
);
