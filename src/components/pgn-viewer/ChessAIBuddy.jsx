import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import Chess from 'chess.js';
import {
  addPgnToArr,
  setChessAIResponse,
  setLoader,
} from '../../actions/board';
import ReviewChessAI from './ReviewChessAI';
import ChessAIProgressBar from './ChessAIProgressBar';
import Typewriter from './Typewriter';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgnStr: state.board.pgnStr,
    chessAIResponse: state.board.chessAIResponse,
    userInfo: state.cloud.userInfo,
    loader: state.board.loader,
  };
};

const ChessAIBuddy = ({
  fen,
  pgnStr,
  chessAIResponse,
  addPgnToArr,
  setChessAIResponse,
  userInfo,
  chessAISocketResp,
  setChessAISocketResp,
  loader,
  setLoader,
}) => {
  const [chessBuddyResponse, setChessBuddyResponse] = useState({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reviewFen, setReviewFen] = useState('');
  const [reviewPgnStr, setReviewPgnStr] = useState('');
  const [isReviewSent, setIsReviewSent] = useState(false);
  const [fullTextResponse, setFullTextResponse] = useState('');

  const chess = new Chess();

  const analyzeGPTHandler = () => {
    setChessBuddyResponse({});
    setRunning(true);
    setProgress(0);
    setReviewFen(fen);
    setReviewPgnStr(pgnStr);
    setIsReviewSent(false);
    setChessAISocketResp([]);
    setChessAIResponse();
  };

  useEffect(() => {
    if (loader === 'activate-gpt') {
      analyzeGPTHandler();
    }
  }, [loader]);

  const setTextAndResponse = (text, buddyResponse) => {
    setFullTextResponse(text);
    setChessBuddyResponse(buddyResponse);
    setRunning(false);
    setProgress(0);
  };

  useEffect(() => {
    if (chessAIResponse && chessAIResponse.moves_map) {
      setChessBuddyResponse(chessAIResponse);
      setFullTextResponse(chessAISocketResp.join('\n\n'));
    } else if (chessAIResponse === null) {
      let responseText = !chessAISocketResp || (chessAISocketResp && !chessAISocketResp.length)
        ? 'Oops! Something went wrong. Please, try again.'
        : chessAISocketResp.join('\n\n');
      setTextAndResponse(responseText, { moves_map: {} });
      return;
    }
    if (loader !== 'activate-gpt') {
      setRunning(false);
      setProgress(0);
    } else {
      setLoader('');
    }
  }, [chessAIResponse]);

  const replaceMovesWithDescriptions = () => {
    let modifiedText = fullTextResponse;

    const regexBreaks = new RegExp(`\\n`, 'g');
    modifiedText = modifiedText.replace(regexBreaks, ' <br /> ');

    if (chessBuddyResponse && chessBuddyResponse.moves_map) {
      const moves_map = chessBuddyResponse.moves_map;
      for (const move in moves_map) {
        const fens = moves_map[move];
        const regexMove = new RegExp(
          `\\b${move}\\b(?=(?:[^"]*"[^"]*")*[^"]*$)`,
          'g'
        );
        const matches = modifiedText.match(regexMove);

        const numberOfMatches = matches ? matches.length : 0;

        let skipNumber =
          numberOfMatches > fens && fens.length ? numberOfMatches - fens.length : 0;
        let indx = 0;
        modifiedText = modifiedText.replace(regexMove, (match) => {
          const fen = fens[indx];
          const changeWith = `<span class="chessai-move" data-fen="${fen}">${move}</span>`;
          skipNumber ? skipNumber-- : indx++;
          return changeWith;
        });
      }
    }

    const regexLink = new RegExp('(?:https?|ftp):\\\/\\\/[\\S]+', 'gi');

    modifiedText = modifiedText.replace(regexLink, (match) => {
      return `<a href=${match} class="chessai-link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    const handleClick = (event) => {
      const newFen = event.target.getAttribute('data-fen');
      if (newFen && newFen.length) {
        let chessFen = chess.load(newFen);
        if (!chessFen) {
          let fixedNewFen = newFen.slice(0, -1) + '1';
          chess.load(fixedNewFen);
        }
        addPgnToArr(chess.pgn(), {});
      }
    };

    return (
      <div
        className="chessai-buddy-subbody"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: modifiedText }}
      />
    );
  };

  return (
    <div className="ml-3 mt--10">
      <div className="chessai-buddy-header mt--10">
        <p>Ask Chess AI Buddy about Your Position</p>
        <button
          className="green-btn mt-0"
          onClick={() => {
            analyzeGPTHandler();
          }}
          disabled={running}
        >
          Analyze with GPT
        </button>
        <ChessAIProgressBar
          running={running}
          setRunning={setRunning}
          progress={progress}
          setProgress={setProgress}
          chessAISocketResp={chessAISocketResp}
        />
      </div>
      {chessAISocketResp && chessAISocketResp.length && !chessBuddyResponse.moves_map ? (
        <div className="chessai-buddy-body">
          <div className="chessai-buddy-subbody">
            {chessAISocketResp.map((paragraph, indx) => {
              return indx === chessAISocketResp.length - 1 ? (
                <p key={indx}>
                  <Typewriter text={paragraph} delay={15} />
                </p>
              ) : (
                <p key={indx}>{paragraph}</p>
              );
            })}
          </div>
        </div>
      ) : (
        <></>
      )}
      {chessBuddyResponse && chessBuddyResponse.moves_map ? (
        <>
          <div className="chessai-buddy-body">
            {replaceMovesWithDescriptions()}
          </div>
          <ReviewChessAI
            reviewFen={reviewFen}
            reviewPgnStr={reviewPgnStr}
            gptResponse={fullTextResponse}
            userInfo={userInfo}
            isSent={isReviewSent}
            setIsSent={setIsReviewSent}
          />
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default connect(mapStateToProps, {
  addPgnToArr,
  setChessAIResponse,
  setLoader,
})(ChessAIBuddy);
