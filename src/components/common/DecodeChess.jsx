import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Accordion from 'react-bootstrap/Accordion';
import { addPgnToArr, setFen } from '../../actions/board';
import run_decode from '../../utils/decode/decode-main';
import {
  disableDecodeChessButton,
} from '../../utils/utils';
import Chess from 'chess.js';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgn: state.board.pgn,
    nextMove: state.board.nextMove,
    plans: state.cloud.plans,
    allPgnArr: state.board.allPgnArr,
    activePgnTab: state.board.activePgnTab,
  };
};

const DecodeChess = (props) => {
  const {
    fen,
    nextMove,
    plans,
    addPgnToArr,
    allPgnArr,
    activePgnTab,
    pgn,
    setFen,
    explanationsContainer,
    setExplanationsContainer,
  } = props;
  const [runDecode, setRunDecode] = useState(false);

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
  }, [plans]);

  useEffect(()=>{
    if(runDecode){
      setExplanationsContainer(true);
    }  
  }, [runDecode])

  const handleDecodeRun = (e, fen, nexMove) => {
    e.stopPropagation();
    setRunDecode(!runDecode);
    run_decode(fen, nexMove); 
  };

  const showDecodeSectionHeadInfo = (plans) => {
    const { decode_trial_passed, decode_chess } = plans;
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
        <Accordion.Item eventKey="0" className="accordion-item mt--10 ml-3">
          <Accordion.Button className="accordion-button">
            <div className="decode-info-text-wrapper">
              {showDecodeSectionHeadInfo(plans)}
            </div>
            <div className="run-decode-button-wrapper">
              <button
                id="run-decode-button"
                disabled={disableDecodeChessButton(plans)}
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
              style={{ display: explanationsContainer ? '' : 'none' }}
            >
              <div className="explanation-area">
                <div
                  className="explanations-container"
                  id="explanations-container"
                ></div>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

export default connect(mapStateToProps, { addPgnToArr, setFen })(
  React.memo(DecodeChess)
);
