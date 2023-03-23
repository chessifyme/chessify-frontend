import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Chess from 'chess.js';
import { addMoveNumbersToSans } from '../../utils/chess-utils';
import { doMove, setFen, setAnalyzingFenTabIndx } from '../../actions/board';
import { ENGINES } from '../../constants/cloud-params';
import { IoIosLock, IoIosUnlock, IoIosClose } from 'react-icons/io';

const mapStateToProps = (state) => {
  return {
    savedAnalyzeInfo: state.cloud.savedAnalyzeInfo,
    proAnalyzers: state.cloud.proAnalyzers,
  };
};

const getEngineName = (analyzer) => {
  if (
    analyzer.analysis &&
    analyzer.analysis.depth === '1' &&
    analyzer.analysis.variations &&
    analyzer.analysis.variations[0] &&
    analyzer.analysis.variations[0].nps === '0'
  ) {
    return 'Syzygy';
  }

  let engineName = `${ENGINES[analyzer.analysis.engine]} ${
    analyzer.temp ? '(Free)' : ''
  } `;

  // LCZero run Stockfish temporary
  if (analyzer.analysis.engine === 'lc0' && analyzer.temp) {
    engineName = `${ENGINES.Stockfish} (Free)`;
  }

  return engineName;
};

const SavedAnalysisBlock = ({
  engine,
  analysis,
  fenToAnalyze,
  doMove,
  setFen,
  serverName,
}) => {
  // ToDo make move clickable

  // const [lockAnalysis, setLockAnalysis] = useState(false);

  // const handleMoveClick = (moves, index) => {
  //   const chess = new Chess();
  //   for (let i = 0; i <= index; i++) {
  //     const move = moves[i][0];
  //     chess.move(move);
  //     doMove(move);
  //   }
  //   const fen = chess.fen();
  //   setFen(fen);
  // };

  // const handleLockAnalysis = () => {
  //   setLockAnalysis(!lockAnalysis);
  // };

  const handleRemoveAnlyzeFromSessionStorage = (engineName) => {
    const dataFromLoacalStroage = JSON.parse(
      sessionStorage.getItem('latest_analyze_info')
    );
    const result = dataFromLoacalStroage.filter(
      (item) => item.name !== engineName
    );
    sessionStorage.setItem('latest_analyze_info', JSON.stringify(result));
  };

  return (
    <div className="saved-analysis-block">
      <div className="displayed-analyze-info">
        <div className="title rbt-section-title">
          <span>{`${engine}`}</span>
          <span>{`depth: ${analysis.depth}`}</span>
          <span>{`speed: ${
            analysis.variations &&
            analysis.variations[0] &&
            analysis.variations[0].nps &&
            Math.floor(parseInt(analysis.variations[0].nps) / 1000)
          } kN/s`}</span>
          <span>{`nodes: ${
            analysis.variations &&
            analysis.variations[0] &&
            analysis.variations[0].nodes &&
            (analysis.variations[0].nodes / 1000000).toFixed(2)
          } MN`}</span>
          <span>{`tbhits: ${
            analysis.variations &&
            analysis.variations[0] &&
            analysis.variations[0].tbhits
          }`}</span>
        </div>
        <div className="pv-btn-wrapper">
          <button
            className="remove-saved-analyze-button"
            title="Remove"
            onClick={() => {
              handleRemoveAnlyzeFromSessionStorage(serverName);
            }}
          >
            <IoIosClose style={{ color: '#959d99', fontSize: '22px' }} />
          </button>
        </div>
        {/* <div className="pv-btn-wrapper ">
          {lockAnalysis && (
            <button
              className="lock-button"
              title="Unlock"
              onClick={handleLockAnalysis}
            >
              <IoIosLock />
            </button>
          )}

          {!lockAnalysis && (
            <button
              className="lock-button"
              title="Lock"
              onClick={handleLockAnalysis}
            >
              <IoIosUnlock />
            </button>
          )}
        </div> */}
      </div>
      <ul className="list-style--1" style={{ whiteSpace: 'nowrap' }}>
        {analysis.variations.map((variation, indx) =>
          indx === 0 ||
          (analysis.variations &&
            analysis.variations[0] &&
            analysis.variations[0].nps !== '0') ||
          analysis.depth !== '1' ? (
            <li>
              <span className="result">{`(${variation.score}) `}</span>
              {variation.pgn &&
                addMoveNumbersToSans(fenToAnalyze, variation.pgn).map(
                  (moveObj, i) => (
                    <button
                      disabled={true}
                      className="analyze-move"
                      // onClick={() => handleMoveClick(variation.pgn, i)}
                    >{`${moveObj.move_number} ${moveObj.move} `}</button>
                  )
                )}
            </li>
          ) : (
            <></>
          )
        )}
      </ul>
    </div>
  );
};

const SavedAnalysisArea = ({
  doMove,
  savedAnalyzeInfo,
  serverName,
  setFen,
  setAnalyzingFenTabIndx,
  proAnalyzers,
}) => {
  useEffect(() => {
    if (!proAnalyzers) {
      setAnalyzingFenTabIndx(null);
    }
  }, [proAnalyzers]);

  return (
    <React.Fragment>
      {savedAnalyzeInfo.map((analyzer) => {
        return (
          <>
            {analyzer.analysis && analyzer.name === serverName && (
              <div
                className="main-container-wrapper"
                key={analyzer.analyzer.url}
              >
                <div className="analyze-area">
                  <SavedAnalysisBlock
                    key={analyzer.analyzer.url}
                    engine={getEngineName(analyzer)}
                    analysis={analyzer.analysis}
                    fenToAnalyze={analyzer.fen}
                    doMove={doMove}
                    setFen={setFen}
                    serverName={serverName}
                  />
                </div>
              </div>
            )}
          </>
        );
      })}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  doMove,
  setFen,
  setAnalyzingFenTabIndx,
})(SavedAnalysisArea);
