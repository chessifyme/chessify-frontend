import React from 'react';
import { openLichessGame } from '../../utils/api';

const ReferenceContextMenu = (props) => {
  const {
    top,
    left,
    reverse,
    setVarGameHandler,
    moveData,
    setGameHandler,
  } = props;

  return (
    <div
      className="move-contextmenu ref-contextmenu"
      style={{ left: left, top: top }}
    >
      <ul>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
            onClick={() => {
              setVarGameHandler(moveData);
            }}
          >
            <div>Copy to Notation</div>
          </button>
        </li>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
            onClick={() => {
              if (!moveData.pgn) {
                openLichessGame(moveData.id).then((pgn) => {
                  setGameHandler(pgn, moveData);
                });
              } else {
                setGameHandler(moveData);
              }
            }}
          >
            <div>Open in New Tab</div>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ReferenceContextMenu;
