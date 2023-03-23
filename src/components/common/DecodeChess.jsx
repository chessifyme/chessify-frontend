import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Accordion from 'react-bootstrap/Accordion';
import { addPgnToArr, setFen } from '../../actions/board';
import run_decode from '../../utils/decode/decode-main';
import { handleSubscribeDecodeChss } from '../../utils/api';
import {
  disableDecodeChessButton,
  showDecodeChessSpecialOfferSection,
} from '../../utils/utils';
import { IoIosClose } from 'react-icons/io';
import Chess from 'chess.js';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgn: state.board.pgn,
    nextMove: state.board.nextMove,
    userFullInfo: state.cloud.userFullInfo,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
  };
};

const DecodeChess = (props) => {
  const {
    fen,
    nextMove,
    userFullInfo,
    addPgnToArr,
    allPgnArr,
    activePgnTab,
    pgn,
    setFen,
  } = props;
  const [explanationsContainer, setExplanationsContainer] = useState(false);
  const [showSubscribeSrction, setShowSubscribeShow] = useState(true);

  useEffect(() => {
    const box = document.getElementById('explanations-container');

    if (box.childNodes.length === 0) {
      setExplanationsContainer(false);
    } else {
      setExplanationsContainer(true);
    }
    window.setFenFromDecode = function (fen) {
      if (fen) {
        if (
          Object.keys(allPgnArr[activePgnTab].tabFile).length === 0 ||
          !pgn.moves ||
          (pgn.moves && !pgn.moves.length && !pgn.headers)
        ) {
          setFen(fen);
        } else {
          const chess = new Chess();
          let chessFen = chess.load(fen);
          if (!chessFen) {
            let fixedNewFen = fen.slice(0, -1) + '1';
            chess.load(fixedNewFen);
          }
          let score = ' *';
          if (chess.game_over() && chess.in_checkmate()) {
            score = chess.turn() === 'w' ? ' 1-0' : ' 0-1';
          } else if (chess.game_over() && chess.in_draw()) {
            score = ' 1/2-1/2';
          }
          addPgnToArr(chess.pgn() + score, {});
        }
      }
    };
  }, [userFullInfo]);

  const handleDecodeRun = (e, fen, nexMove) => {
    e.stopPropagation();
    run_decode(fen, nexMove);
  };

  const handleCloseSubscribeSection = () => {
    setShowSubscribeShow(!showSubscribeSrction);
  };

  const showDecodeSectionHeadInfo = (userFullInfo) => {
    const { decode_trial_passed, decode_chess } = userFullInfo;
    if (decode_chess !== null) {
      return (
        <b>
          Get your games explained with the popular AI-powered
          tutor.&nbsp;&nbsp;
        </b>
      );
    }
    if (decode_trial_passed === false) {
      return (
        <b>
          Get your games explained with the popular AI-powered tutor. Try for
          free.&nbsp;&nbsp;
        </b>
      );
    }
    if (decode_trial_passed === true && decode_chess === null) {
      return (
        <b>
          Get your games explained with the popular AI-powered tutor. 20 coins /
          decode.&nbsp;&nbsp;
        </b>
      );
    }
  };

  return (
    <>
      <Accordion defaultActiveKey={'0'} alwaysOpen>
        <Accordion.Item eventKey="0" className="accordion-item">
          <Accordion.Button className="accordion-button">
            <div className="decode-info-text-wrapper">
              {showDecodeSectionHeadInfo(userFullInfo)}
            </div>
            <div className="run-decode-button-wrapper">
              <button
                id="run-decode-button"
                disabled={disableDecodeChessButton(userFullInfo)}
                onClick={(e) => handleDecodeRun(e, fen, nextMove)}
                className="run-decode-button"
              >
                Run Decode
              </button>
            </div>
            <div id="progress">
              <div id="percent"></div>
            </div>
          </Accordion.Button>
          <Accordion.Body>
            <div
              className="mid-container"
              style={{ display: explanationsContainer === true ? '' : 'none' }}
            >
              <div className="explanation-area">
                <div
                  className="explanations-container"
                  id="explanations-container"
                ></div>
              </div>
            </div>
            {showDecodeChessSpecialOfferSection(userFullInfo) && (
              <div
                className={
                  showSubscribeSrction
                    ? 'decodeChessSubscribtionInfo'
                    : 'hide-decodeChessSubscribtionInfo'
                }
              >
                <div className="d-flex flex-row justify-content-between float-right">
                  <button
                    className="modal-close-decode"
                    type="button"
                    onClick={handleCloseSubscribeSection}
                  >
                    <IoIosClose className="close-decode-subscribe" />
                  </button>
                </div>
                <h6>
                  Special offer to Chessify members: Unlock unlimited access for
                  12 months, now at only $42 instead of $84
                </h6>
                <button onClick={handleSubscribeDecodeChss}>
                  Add DecodeChess
                </button>
              </div>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default connect(mapStateToProps, { addPgnToArr, setFen })(
  React.memo(DecodeChess)
);
