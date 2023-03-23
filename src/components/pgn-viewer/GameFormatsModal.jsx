import React, { useState, useEffect } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { downloadPGN } from '../../utils/chess-utils';
import { addPgnToArr, setFen, setPgn } from '../../actions/board';
import { setPgnHeader } from '../../utils/pgn-viewer';
import Chess from 'chess.js';
import { MdAddAPhoto } from 'react-icons/md';
import DropImage from './DropImage';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgnStr: state.board.pgnStr,
    pgn: state.board.pgn,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const GameFormatsModal = ({
  fen,
  pgnStr,
  pgn,
  isOpen,
  handleModal,
  setActiveTabPgnViewer,
  addPgnToArr,
  setPgn,
  setFen,
  userFullInfo,
  setScannerImg,
}) => {
  const [newFen, setNewFen] = useState(fen);
  const [newPgn, setNewPgn] = useState(pgnStr);
  const [activeTab, setActiveTab] = useState(0);
  const chess = new Chess();

  useEffect(() => {
    setNewFen(fen);
  }, [fen]);

  useEffect(() => {
    setNewPgn(pgnStr);
  }, [pgnStr]);

  const handleCloseModal = () => {
    handleModal(false);
    setActiveTab(0);
  };

  const copyNotation = () => {
    let notationCopy = activeTab === 1 ? newFen : newPgn;
    if (activeTab === 0) {
      chess.load_pgn(notationCopy, { sloppy: true });
      let header = setPgnHeader(chess.header());
      notationCopy = header + (header.length ? '\n' : '') + notationCopy;
    }
    navigator.clipboard.writeText(notationCopy);
  };

  const applyFenHandler = (newFen) => {
    setActiveTabPgnViewer(0);
    if (!pgn.moves || (pgn.moves && !pgn.moves.length && !pgn.headers)) {
      setFen(newFen);
    } else {
      let chessFen = chess.load(newFen);
      if (!chessFen) {
        let fixedNewFen = newFen.slice(0, -1) + '1';
        chess.load(fixedNewFen);
      }
      addPgnToArr(chess.pgn(), {});
    }
    handleCloseModal();
  };

  const applyPgnHandler = () => {
    setActiveTabPgnViewer(0);
    if (!pgn.moves || (pgn.moves && !pgn.moves.length && !pgn.headers)) {
      setPgn(newPgn);
    } else {
      addPgnToArr(newPgn, {});
    }
    handleCloseModal();
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      keyboard={true}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="d-flex flex-row justify-content-between">
          <h3 className="game-format-title">Game Formats</h3>
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
        <Tabs>
          <TabList>
            <div className="format-menu">
              <div className="d-flex flex-row">
                <div className="format-taglist">
                  <Tab
                    className={`format-pgn  ${
                      activeTab === 0 && 'format-pgn-active'
                    }`}
                    onClick={() => setActiveTab(0)}
                  >
                    PGN
                  </Tab>
                  <Tab
                    className={`format-fen ${
                      activeTab === 1 && 'format-fen-active'
                    }`}
                    onClick={() => setActiveTab(1)}
                  >
                    FEN
                  </Tab>
                  <Tab
                    className={`format-fen ${
                      activeTab === 2 && 'format-fen-active'
                    }`}
                    onClick={() => {
                      setActiveTab(2);
                    }}
                  >
                    Scan
                  </Tab>
                </div>
              </div>
              <div>
                <button
                  className="game-format-btn copy-btn"
                  onClick={copyNotation}
                >
                  <img
                    src={require('../../../public/assets/images/pgn-viewer/copy-notation.svg')}
                    width="20"
                    height="20"
                    alt=""
                  />
                  <span>Copy</span>
                </button>
                <button
                  className="game-format-btn download-btn"
                  onClick={() => downloadPGN(newPgn)}
                >
                  <img
                    src={require('../../../public/assets/images/pgn-viewer/download-pgn.svg')}
                    width="20"
                    height="20"
                    alt=""
                  />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </TabList>
          <TabPanel>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyPgnHandler(newPgn);
              }}
            >
              <div className="form-group">
                <textarea
                  className="pgn-textarea"
                  type="text"
                  name="pgn_input"
                  value={newPgn}
                  rows="4"
                  onChange={(e) => setNewPgn(e.target.value)}
                />
              </div>
              <div className="d-flex flex-row justify-content-between">
                <Button
                  className="game-format-btn game-format-close-btn"
                  variant="primary"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
                <Button
                  className="apply-btn"
                  variant="primary"
                  onClick={() => {
                    applyPgnHandler();
                  }}
                >
                  Apply
                </Button>
              </div>
            </form>
          </TabPanel>
          <TabPanel>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyFenHandler(newFen);
              }}
            >
              <div className="form-group">
                <input
                  className="fen-input"
                  type="text"
                  name="fen_input"
                  value={newFen}
                  onChange={(e) => setNewFen(e.target.value)}
                />
              </div>
            </form>
            <div className="d-flex flex-row justify-content-between">
              <Button
                className="game-format-btn game-format-close-btn"
                variant="primary"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button
                className="apply-btn"
                variant="primary"
                onClick={() => {
                  applyFenHandler(newFen);
                }}
              >
                Apply
              </Button>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="d-flex flex-row justify-content-center">
              <DropImage
                handleCloseModal={handleCloseModal}
                setScannerImg={setScannerImg}
              />
            </div>
          </TabPanel>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  addPgnToArr,
  setFen,
  setPgn,
})(GameFormatsModal);
