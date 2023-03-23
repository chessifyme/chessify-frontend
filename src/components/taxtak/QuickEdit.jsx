import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  setMatchedPositionName,
  addPgnToArr,
  setFen,
  setEditMode,
} from '../../actions/board';
import {
  MdRotate90DegreesCcw,
  MdLayers,
  MdMusicNote,
  MdAddAPhoto,
} from 'react-icons/md';
import { INITIAL_FEN } from '../../constants/board-params';
import DropImage from '../pgn-viewer/DropImage';
import { Modal } from 'react-bootstrap';

const QuickEdit = ({
  orientation,
  soundMode,
  updateSoundMode,
  setFen,
  setBoardOrientation,
  setMatchedPositionName,
  setScannerImg,
}) => {
  const [showDropImgModal, setShowDropImgModal] = useState(false);
  const handleSoundToggle = () => {
    soundMode === 'on' ? updateSoundMode('off') : updateSoundMode('on');
  };

  const handleCloseModal = () => {
    setShowDropImgModal(false);
  };

  return (
    <div className="mb-2">
      <button
        className="white-button"
        onClick={() => {
          setBoardOrientation(orientation === 'white' ? 'black' : 'white');
        }}
      >
        <MdRotate90DegreesCcw size={18} /> Flip
      </button>
      <button
        className="white-button ml-2"
        onClick={() => {
          window.confirm(
            "You're going to reset the board. Make sure you've saved your current game."
          ) &&
            (() => {
              setFen(INITIAL_FEN);
              setMatchedPositionName(null);
            })();
        }}
      >
        <MdLayers size={18} /> Reset
      </button>
      <button
        className="white-button ml-2"
        onClick={() => {
          handleSoundToggle();
        }}
      >
        <MdMusicNote size={18} /> {soundMode === 'off' ? 'OFF' : 'ON'}
      </button>
      <button
        className="white-button ml-2 white-button-scan"
        onClick={() => {
          setShowDropImgModal(true);
        }}
      >
        <MdAddAPhoto size={18} />
        Scan Board
        <sup>New</sup>
      </button>
      <Modal
        show={showDropImgModal}
        onHide={handleCloseModal}
        keyboard={false}
        size={'md'}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="border-radius-dialog"
      >
        <Modal.Body>
          <DropImage
            handleCloseModal={handleCloseModal}
            setScannerImg={setScannerImg}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default connect(null, {
  setMatchedPositionName,
  addPgnToArr,
  setFen,
  setEditMode,
})(QuickEdit);
