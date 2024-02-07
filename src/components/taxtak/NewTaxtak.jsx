import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  setPgn,
  doMove,
  addCommandToMove,
  addCommandToHeader,
} from '../../actions/board';
import Chess from 'chess.js';
import Chessground from 'react-chessground';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    orientation: state.board.orientation,
    pgn: state.board.pgn,
    numPV: state.cloud.numPV,
    freeAnalyzer: state.cloud.freeAnalyzer,
    proAnalyzers: state.cloud.proAnalyzers,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    fullAnalysisOn: state.cloud.fullAnalysisOn,
    userInfo: state.cloud.userInfo,
    activeMove: state.board.activeMove,
    referenceData: state.board.referenceData,
  };
};

const NewTaxtak = ({
  doMove,
  fen,
  pgn,
  orientation,
  soundMode,
  proAnalyzers,
  activePgnTab,
  analyzingFenTabIndx,
  fullAnalysisOn,
  userInfo,
  activeMove,
  addCommandToMove,
  addCommandToHeader,
  referenceData,
}) => {
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [lastMove, setLastMove] = useState();
  const [drawShapes, setDrawShapes] = useState([]);
  const [lastShape, setLastShape] = useState({});

  useEffect(() => {
    setLastMove(null);
    const moveSound = document.getElementById('move_sound');
    const playPromise = soundMode === 'on' ? moveSound.play() : '';

    if (playPromise !== undefined && soundMode === 'on') {
      playPromise
        .then((_) => {
          console.log('audio played auto');
        })
        .catch((error) => {
          console.log('playback prevented');
        });
    }
  }, [fen]);

  const onMove = (from, to) => {
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });
    for (let i = 0, len = moves.length; i < len; i++) {
      if (moves[i].flags.indexOf('p') !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }

    if (chess.move({ from, to, promotion: 'x' })) {
      if (
        !fullAnalysisOn &&
        proAnalyzers &&
        proAnalyzers.length > 0 &&
        (analyzingFenTabIndx === activePgnTab || analyzingFenTabIndx === null)
      ) {
        doMove({ from, to, promotion: 'x' }, 0);
      } else {
        setTimeout(() => doMove({ from, to, promotion: 'x' }, 0));
      }
      setLastMove([from, to]);
    }
  };

  const promotion = (e) => {
    const from = pendingMove[0];
    const to = pendingMove[1];
    doMove({ from, to, promotion: e });
    setLastMove([from, to]);
    setSelectVisible(false);
  };

  const turnColor = () => {
    const turn = new Chess(fen).turn();
    return turn === 'w' ? 'white' : 'black';
  };

  const calcMovable = () => {
    const chess = new Chess(fen);
    const dests = new Map();
    chess.SQUARES.forEach((s) => {
      const ms = chess.moves({ square: s, verbose: true });
      if (ms.length)
        dests.set(
          s,
          ms.map((m) => {
            return m.to;
          })
        );
    });

    return {
      free: false,
      dests,
      color: turnColor(),
    };
  };

  const addCommands = (comment, autoShapes, brushes) => {
    if (comment.commands && comment.commands.length) {
      comment.commands.forEach((command) => {
        if (
          command &&
          command.key === 'cal' &&
          command.values &&
          command.values.length
        ) {
          command.values.forEach((value) => {
            let colorIndicator = value.slice(0, 1);
            let orig = value.slice(1, 3);
            let dest = value.slice(3);
            let color = '#15781B';
            if (colorIndicator === 'B') {
              color = '#003088';
            } else if (colorIndicator === 'R') {
              color = '#882020';
            } else if (colorIndicator === 'Y') {
              color = '#e68f00';
            }
            autoShapes.push({
              orig: orig,
              dest: dest,
              brush: colorIndicator,
            });
            brushes[colorIndicator] = makeCustomBrush({
              key: colorIndicator,
              color: color,
              opacity: 10,
              lineWidth: 8,
            });
          });
        } else if (
          command &&
          command.key === 'csl' &&
          command.values &&
          command.values.length
        ) {
          command.values.forEach((value) => {
            let colorIndicator = value.slice(0, 1);
            let orig = value.slice(1);
            let color = '#15781B';
            if (colorIndicator === 'B') {
              color = '#003088';
            } else if (colorIndicator === 'R') {
              color = '#882020';
            } else if (colorIndicator === 'Y') {
              color = '#e68f00';
            }
            autoShapes.push({
              orig: orig,
              dest: undefined,
              brush: colorIndicator,
            });
            brushes[colorIndicator] = makeCustomBrush({
              key: colorIndicator,
              color: color,
              opacity: 10,
              lineWidth: 8,
            });
          });
        }
      });
    }
  };

  function arrowMove() {
    let autoShapes = [];
    let brushes = {};
    if (
      userInfo &&
      userInfo.arrows_enabled &&
      !fullAnalysisOn &&
      proAnalyzers &&
      proAnalyzers.length > 0 &&
      proAnalyzers[0] &&
      proAnalyzers[0].isAnalysing &&
      proAnalyzers[0].analysis.variations[0] &&
      (analyzingFenTabIndx === activePgnTab || analyzingFenTabIndx === null)
    ) {
      const arrowShape = proAnalyzers[0].analysis.variations[0].arrowShape;
      autoShapes.push({
        orig: arrowShape.slice(0, 2),
        dest: arrowShape.slice(2),
        color: turnColor(),
        brush: 'analysisArrow',
      });
      brushes.analysisArrow = makeCustomBrush({
        key: 'analysisArrow',
        color: '#358c65',
        opacity: 10,
        lineWidth: 8,
      });
    }

    if (activeMove && activeMove.comments && activeMove.comments.length) {
      activeMove.comments.forEach((comment) => {
        addCommands(comment, autoShapes, brushes);
      });
    } else if (
      pgn &&
      pgn.comments &&
      pgn.comments.length &&
      ((activeMove && Object.keys(activeMove).length === 0) || !activeMove)
    ) {
      pgn.comments.forEach((comment) => {
        addCommands(comment, autoShapes, brushes);
      });
    }
    return {
      enabled: true,
      autoShapes: autoShapes,
      brushes: brushes,
      onChange: (shape) => {
        setDrawShapes([...drawShapes, ...shape]);
        setLastShape(shape[0]);
      },
    };
  }

  function makeCustomBrush(base) {
    return {
      color: base.color,
      opacity: Math.round(base.opacity * 10) / 10,
      lineWidth: base.lineWidth,
      key: base.key,
    };
  }

  const selectSquare = (square) => {
    const getSquare = document.querySelector('.move-dest');
    if (!getSquare) {
      moveFrom(square);
    }
  };

  function findDuplicateIndices(objectsArray) {
    const seenObjects = new Map();
    const duplicateIndices = [];

    for (let i = 0; i < objectsArray.length; ++i) {
      const obj = objectsArray[i];
      const objectKey = `${obj.orig}-${obj.dest}`;

      if (seenObjects.has(objectKey)) {
        duplicateIndices.push(i, seenObjects.get(objectKey));
      } else {
        seenObjects.set(objectKey, i);
      }
    }
    return duplicateIndices;
  }

  function moveFrom(square) {
    const chess = new Chess(fen);
    const ms = chess.moves({ verbose: true });
    const foundMove = ms.filter((m) => m.to === square);

    for (let i = 0; i < foundMove.length; ++i) {
      if (foundMove[i].flags.indexOf('p') !== -1 && foundMove[i].to == square) {
        setPendingMove([foundMove[i].from, foundMove[i].to]);
        setSelectVisible(true);
        return;
      }
    }
    if (foundMove.length === 0) {
      return;
    }
    if (foundMove.length === 1) {
      doMove(
        { from: foundMove[0].from, to: foundMove[0].to, promotion: 'x' },
        0
      );
    } else {
      if (
        referenceData &&
        referenceData.statistics &&
        referenceData.statistics.length > 0
      ) {
        const moveFrom = referenceData.statistics.reduce((acc, el, i) => {
          const from = el.ucimove.slice(0, 2);
          const to = el.ucimove.slice(2);
          const findel = foundMove.find(
            (val) => val.from.includes(from) && to == square
          );
          if (findel) {
            acc.push(referenceData.statistics[i]);
          }
          return acc.sort((a, b) => b.games_count - a.games_count);
        }, []);

        if (moveFrom.length > 0) {
          const from = moveFrom[0].ucimove.slice(0, 2);
          doMove({ from: from, to: foundMove[0].to, promotion: 'x' }, 0);
        } else {
          doMove(
            { from: foundMove[0].from, to: foundMove[0].to, promotion: 'x' },
            0
          );
        }
      } else {
        doMove(
          { from: foundMove[0].from, to: foundMove[0].to, promotion: 'x' },
          0
        );
      }
    }
  }

  useEffect(() => {
    if (Object.keys(lastShape).length !== 0) {
      const shape = lastShape;
      let command = null;
      if (shape.dest) {
        command = {
          key: 'cal',
          values: [`${shape.brush[0].toUpperCase()}${shape.orig}${shape.dest}`],
        };
      } else {
        command = {
          key: 'csl',
          values: [`${shape.brush[0].toUpperCase()}${shape.orig}`],
        };
      }
      if (activeMove && Object.keys(activeMove).length !== 0) {
        addCommandToMove(activeMove, command);
      } else {
        addCommandToHeader(command);
      }
      let duplicateIndices = findDuplicateIndices(drawShapes);
      duplicateIndices.forEach((i) => {
        drawShapes.splice(i, 1);
      });

      setLastShape({});
    }
  }, [lastShape]);

  useEffect(() => {
    setDrawShapes([]);
  }, [activeMove]);

  return (
    <>
      <div
        className={
          userInfo && userInfo.board_theme ? userInfo.board_theme : 'wood4'
        }
        style={{ '--zoom': 85, padding: '6px' }}
      >
        <div className="is2d">
          <div style={{ cursor: 'pointer', display: 'block' }}>
            <div className="main-board">
              <div
                id="promotion-choice"
                className="top"
                style={{ display: selectVisible ? '' : 'none' }}
              >
                <square style={{ top: '25%', left: '45%' }}>
                  <piece
                    className={`queen ${turnColor()}`}
                    onClick={() => promotion('q')}
                  ></piece>
                </square>
                <square style={{ top: '37.5%', left: '45%' }}>
                  <piece
                    className={`knight ${turnColor()}`}
                    onClick={() => promotion('n')}
                  ></piece>
                </square>
                <square style={{ top: '50%', left: '45%' }}>
                  <piece
                    className={`rook ${turnColor()}`}
                    onClick={() => promotion('r')}
                  ></piece>
                </square>
                <square style={{ top: '62.5%', left: '45%' }}>
                  <piece
                    className={`bishop ${turnColor()}`}
                    onClick={() => promotion('b')}
                  ></piece>
                </square>
              </div>

              <Chessground
                turnColor={turnColor()}
                movable={calcMovable()}
                lastMove={lastMove}
                fen={fen}
                onMove={onMove}
                promotion={promotion}
                orientation={orientation}
                autoCastle={true}
                animation={{ enabled: false }}
                drawable={arrowMove()}
                onSelect={selectSquare}
              />
            </div>
          </div>
        </div>
      </div>
      <audio preload="auto" id="move_sound">
        <source
          src={require('../../../public/assets/sounds/move.webm')}
          type="audio/webm"
        />
        <source
          src={require('../../../public/assets/sounds/move.ogg')}
          type="audio/ogg"
        />
        <source
          src={require('../../../public/assets/sounds/move.mp3')}
          type="audio/mp3"
        />
        <source
          src={require('../../../public/assets/sounds/move.wav')}
          type="audio/wav"
        />
      </audio>
    </>
  );
};

export default connect(mapStateToProps, {
  setPgn,
  doMove,
  addCommandToMove,
  addCommandToHeader,
})(NewTaxtak);
