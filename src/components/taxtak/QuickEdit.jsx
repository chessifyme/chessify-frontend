import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  setMatchedPositionName,
  addPgnToArr,
  setFen,
  setEditMode,
  setLoader,
} from '../../actions/board';
import {
  MdRotate90DegreesCcw,
  MdLayers,
  MdMusicNote,
  MdAddAPhoto,
  MdShare,
} from 'react-icons/md';
import { INITIAL_FEN } from '../../constants/board-params';
import DropImage from '../pgn-viewer/DropImage';
import { Modal } from 'react-bootstrap';
import Tooltip from '@material-ui/core/Tooltip';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { useLocation } from 'react-router-dom';

const mapStateToProps = (state) => {
  return {
    plans: state.cloud.plans,
    isGuestUser: state.cloud.isGuestUser,
    fen: state.board.fen,
  };
};
const QuickEdit = ({
  orientation,
  soundMode,
  updateSoundMode,
  setFen,
  setBoardOrientation,
  setMatchedPositionName,
  setScannerImg,
  setLoader,
  plans,
  isGuestUser,
  setLoginModal,
  fen,
}) => {
  const [showDropImgModal, setShowDropImgModal] = useState(false);
  const [openClipboardToolTip, setOpenClipboardToolTip] = useState(false);
  const location = useLocation();

  const handleSoundToggle = () => {
    soundMode === 'on' ? updateSoundMode('off') : updateSoundMode('on');
  };

  const handleCloseModal = () => {
    setShowDropImgModal(false);
  };

  const copyToClipboard = () => {
    const link =
      'https://chessify.me' +
      location.pathname.split('?')[0] +
      '?fen=' +
      fen.replaceAll(' ', '%20');

    navigator.clipboard.writeText(link);
    setOpenClipboardToolTip(true);
  };

  return (
    <div className="mb-2">
      <button
        className="white-button"
        title="flip"
        onClick={() => {
          setBoardOrientation(orientation === 'white' ? 'black' : 'white');
        }}
      >
        <MdRotate90DegreesCcw size={18} />
      </button>
      <button
        className="white-button ml-2"
        title={'Reset'}
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
        <MdLayers size={18} />
      </button>
      <button
        className="white-button ml-2"
        title={soundMode === 'off' ? 'OFF' : 'ON'}
        onClick={() => {
          handleSoundToggle();
        }}
      >
        <MdMusicNote size={18} />
      </button>

      <button
        className="white-button ml-2 white-button-scan"
        title={'Scan'}
        onClick={() => {
          setShowDropImgModal(true);
        }}
      >
        <MdAddAPhoto size={18} />
      </button>
      {plans && plans.has_access_chessai_buddy ? (
        <button
          className="white-button ml-2 white-button-scan"
          onClick={() => {
            setLoader('activate-gpt');
          }}
        >
          <span>Analyze with GPT 🔥</span>
        </button>
      ) : (
        <></>
      )}
      <ClickAwayListener onClickAway={() => setOpenClipboardToolTip(false)}>
        <Tooltip
          PopperProps={{
            disablePortal: true,
          }}
          open={openClipboardToolTip}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          onMouseLeave={() => {
            setOpenClipboardToolTip(false);
          }}
          placement="top"
          title={<span style={{ fontSize: '14px' }}>Copied to clipboard</span>}
          arrow
        >
          <button
            className="white-button ml-2 white-button-scan"
            onClick={() => copyToClipboard()}
          >
            <MdShare size={18} />
            <span>
              Copy Board Link <sup>new</sup>
            </span>
          </button>
        </Tooltip>
      </ClickAwayListener>

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
            isGuestUser={isGuestUser}
            setLoginModal={setLoginModal}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default connect(mapStateToProps, {
  setMatchedPositionName,
  addPgnToArr,
  setFen,
  setEditMode,
  setLoader,
})(QuickEdit);
