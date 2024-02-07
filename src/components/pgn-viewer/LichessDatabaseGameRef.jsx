import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import { openLichessGame } from '../../utils/api';
import {
  addPgnToArr,
  changeTabName,
  setActiveMove,
  addCommentToMove,
  doMove,
} from '../../actions/board';
import { findFenMatches, getPgnNextMoves } from '../../utils/chess-utils';
import ReferenceContextMenu from './ReferenceContextMenu';
import { useNavigate } from 'react-router-dom';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgn: state.board.pgn,
    allPgnArr: state.board.allPgnArr,
    activeMove: state.board.activeMove,
  };
};

const LichessDatabaseGameRef = ({
  lichessDB,
  addPgnToArr,
  changeTabName,
  setActiveMove,
  fen,
  pgn,
  allPgnArr,
  activeMove,
  addCommentToMove,
  doMove,
}) => {
  const [searchMoveFen, setSearchMoveFen] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [moveData, setMoveData] = useState();
  const [contextmenuCoords, setContextMenuCoords] = useState({
    x: 0,
    y: 0,
    reverse: false,
  });
  const [commentToAdd, setCommentToAdd] = useState('');
  const navigate = useNavigate();

  const handleContextMenu = (event, game) => {
    event.preventDefault();

    if (window.innerWidth < 800) {
      return;
    }
    const subtructBoardWidth =
      Math.trunc(
        document
          .getElementsByClassName('page-wrapper')[0]
          .getBoundingClientRect().width / 3
      ) + 245;
    let coordX = event.pageX - subtructBoardWidth;
    const coordY = event.pageY - 100;

    let reverse = false;
    const endPoint =
      document
        .getElementsByClassName('dsk-pgn-viewer')[0]
        .getBoundingClientRect().right - subtructBoardWidth;

    if (coordX + 200 > endPoint) {
      coordX -= 200;
      reverse = true;
    }
    setContextMenuCoords({
      x: coordX + 'px',
      y: coordY + 'px',
      reverse: reverse,
    });
    setMoveData(game);
    setShowMenu(true);
  };

  const handleClick = () => {
    if (showMenu) setShowMenu(false);
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [showMenu]);

  const setVarGameHandler = (game) => {
    openLichessGame(game.id).then((pgn) => {
      const lastMoveNum = getPgnNextMoves(pgn, fen, doMove);
      let comment = `${
        game.winner === 'white'
          ? '1-0'
          : game.winner === 'black'
          ? '0-1'
          : '½-½'
      } (${lastMoveNum}) ${game.white.name} (${game.white.rating})-${
        game.black.name
      } (${game.black.rating}) `;
      setCommentToAdd(comment);
    });
  };

  useEffect(() => {
    if (commentToAdd.length) {
      addCommentToMove(activeMove, commentToAdd, null);
      setCommentToAdd('');
    }
  }, [commentToAdd]);

  const setGameHandler = (pgnStr, game) => {
    setSearchMoveFen(fen);
    addPgnToArr(pgnStr, {});
    if (game && game.white && game.white.name && game.black && game.black.name) {
      const newTabName = `${game.white.name} - ${game.black.name}`;
      changeTabName(newTabName, allPgnArr.length - 1);
    }
  };

  useEffect(() => {
    if (searchMoveFen.length) {
      const foundMatches = findFenMatches(searchMoveFen, pgn);
      if (foundMatches && foundMatches[0] && foundMatches[0].move) {
        setActiveMove(foundMatches[0].move);
        setSearchMoveFen('');
        navigate({ pathname: "/analysis"});
      }
    }
  }, [pgn]);

  const setToNotation = (game) => {
    openLichessGame(game.id).then((pgn) => {
      setGameHandler(pgn, game);
    });
  };

  return (
    <div className="scroll mv-ref-table lichess-db-game-ref">
      <div className="reference-divider"></div>
      <b>Recent Games</b>
      <Table hover>
        <thead>
          <tr>
            <th>White</th>
            <th>Elo White</th>
            <th>Black</th>
            <th>Elo Black</th>
            <th>Winner</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {lichessDB && lichessDB.recentGames ? (
            lichessDB.recentGames.map((game) => {
              return (
                <tr
                  key={Math.random()}
                  onClick={() => setToNotation(game)}
                  onContextMenu={(e) => {
                    handleContextMenu(e, game);
                  }}
                >
                  <td>{game.white.name}</td>
                  <td>{game.white.rating}</td>
                  <td>{game.black.name}</td>
                  <td>{game.black.rating}</td>
                  <td>
                    {game.winner === 'white'
                      ? '1-0'
                      : game.winner === 'black'
                      ? '0-1'
                      : '½-½'}
                  </td>
                  <td>{game.month}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </Table>
      <div className="reference-divider"></div>
      <b>Top Games</b>
      <Table hover>
        <thead>
          <tr>
            <th>White</th>
            <th>Elo White</th>
            <th>Black</th>
            <th>Elo Black</th>
            <th>Winner</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {lichessDB && lichessDB.topGames ? (
            lichessDB.topGames.map((game) => {
              return (
                <tr
                  key={Math.random()}
                  onClick={() => setToNotation(game)}
                  onContextMenu={(e) => {
                    handleContextMenu(e, game);
                  }}
                >
                  <td title={game.white.name}>{game.white.name}</td>
                  <td>{game.white.rating}</td>
                  <td title={game.black.name}>{game.black.name}</td>
                  <td>{game.black.rating}</td>
                  <td>
                    {game.winner === 'white'
                      ? '1-0'
                      : game.winner === 'black'
                      ? '0-1'
                      : '½-½'}
                  </td>
                  <td>{game.month}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
        </tbody>
      </Table>
      {showMenu ? (
        <ReferenceContextMenu
          top={contextmenuCoords.y}
          left={contextmenuCoords.x}
          reverse={contextmenuCoords.reverse}
          moveData={moveData}
          setVarGameHandler={setVarGameHandler}
          setGameHandler={setGameHandler}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default connect(mapStateToProps, {
  addPgnToArr,
  changeTabName,
  setActiveMove,
  addCommentToMove,
  doMove,
})(LichessDatabaseGameRef);
