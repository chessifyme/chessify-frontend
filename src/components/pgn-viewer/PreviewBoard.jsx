import React, { useEffect, useState } from 'react';
import Chess from 'chess.js';
import Chessground from 'react-chessground';

const PreviewBoard = ({ fen, userInfo, activeMove, pgn }) => {
  useEffect(() => {
    setLastMove(null);
  }, [fen]);

  const [lastMove, setLastMove] = useState();

  const turnColor = () => {
    const turn = new Chess(fen).turn();
    return turn === 'w' ? 'white' : 'black';  
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
      enabled: false,
      autoShapes: autoShapes,
      brushes: brushes,
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

  return (
    <div
      className={userInfo.board_theme}
      style={{ padding: '6px', width: '100%' }}
    >
      <div className="is2d">
        <div className="main-board">
          <Chessground
            turnColor={turnColor()}
            lastMove={lastMove}
            fen={fen}
            animation={{ enabled: false }}
            drawable={arrowMove()}
            viewOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewBoard;
