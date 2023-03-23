import React from 'react';
import { connect } from 'react-redux';
import { MdEdit, MdCheck } from 'react-icons/md';
import { switchToBoard } from '../../utils/utils';
import { setEditMode } from '../../actions/board';
import QuickEdit from './QuickEdit';

const mapStateToProps = (state) => {
  return {
    isEditMode: state.board.isEditMode,
  };
};

const EditArea = ({
  fen,
  orientation,
  setFen,
  setEditMode,
  setBoardOrientation,
  setPgn,
  isEditMode,
  soundMode,
  updateSoundMode,
  setScannerImg,
  scannerImg,
  setDisplayScannerImg,
}) => {
  const switchEditMode = () => {
    window.LichessEditor.setFen(fen);
    window.LichessEditor.setOrientation(orientation);
    setEditMode(!isEditMode);
  };

  return (
    <div className="edit-sec">
      {isEditMode ? (
        <>
          <button
            className="white-button done-editor-btn"
            onClick={() => {
              switchToBoard(
                setFen,
                setBoardOrientation,
                setEditMode,
                isEditMode,
                setPgn,
                fen
              );
              setScannerImg('');
            }}
          >
            Done
          </button>
          {scannerImg.length ? (
            <button
              className="white-button og-img"
              onClick={() => {
                setDisplayScannerImg();
              }}
            >
              See Original Image
            </button>
          ) : (
            <></>
          )}
        </>
      ) : (
        <div className="d-flex flex-row">
          <button className="white-button" onClick={switchEditMode}>
            <MdEdit size={18} /> Edit
          </button>
          <QuickEdit
            setFen={setFen}
            setBoardOrientation={setBoardOrientation}
            orientation={orientation}
            updateSoundMode={updateSoundMode}
            soundMode={soundMode}
            setScannerImg={setScannerImg}
          />
        </div>
      )}
    </div>
  );
};

export default connect(mapStateToProps, { setEditMode })(EditArea);
