import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import {
  setGameReference,
  setLoader,
  setTourType,
  setTourNumber,
  addPgnToArr,
  changeTabName,
  setActiveMove,
  doMove,
  addCommentToMove,
} from '../../actions/board';
import { convertResult } from '../../utils/pgn-viewer';
import {
  findFenMatches,
  getPgnData,
  getPgnNextMoves,
} from '../../utils/chess-utils';
import ReferenceContextMenu from './ReferenceContextMenu';
import { useNavigate } from 'react-router-dom';

const ACTIVE_DESCENDING = require('../../../public/assets/images/pgn-viewer/active-descending.svg');
const INACTIVE_DESCENDING = require('../../../public/assets/images/pgn-viewer/inactive-descending.svg');
const ACTIVE_ASCENDING = require('../../../public/assets/images/pgn-viewer/active-ascending.svg');

const mapStateToProps = (state) => {
  return {
    referenceData: state.board.referenceData,
    referenceGames: state.board.referenceGames,
    loader: state.board.loader,
    searchParams: state.board.searchParams,
    pageNum: state.board.pageNum,
    fen: state.board.fen,
    allPgnArr: state.board.allPgnArr,
    pgn: state.board.pgn,
    activeMove: state.board.activeMove,
  };
};

const GameReference = ({
  referenceGames,
  loader,
  searchParams,
  setGameReference,
  setLoader,
  fen,
  tourType,
  tourStepNumber,
  setTourNumber,
  setTourType,
  addPgnToArr,
  allPgnArr,
  changeTabName,
  pageNum,
  pgn,
  setActiveMove,
  doMove,
  addCommentToMove,
  activeMove,
}) => {
  const [scrollIndx, setScrollIndx] = useState(null);
  const scrollRef = useRef(null);
  const [searchMoveFen, setSearchMoveFen] = useState('');
  const [contextmenuCoords, setContextMenuCoords] = useState({
    x: 0,
    y: 0,
    reverse: false,
  });
  const [showMenu, setShowMenu] = useState(false);
  const [moveData, setMoveData] = useState();
  const [commentToAdd, setCommentToAdd] = useState('');
  const navigate = useNavigate();

  const setVarGameHandler = (move_data) => {
    const lastMoveNum = getPgnNextMoves(move_data.pgn, fen, doMove);
    let comment = `${convertResult(move_data.result)} (${lastMoveNum}) ${
      move_data.white_name
    } (${move_data.white_rating})-${move_data.black_name} (${
      move_data.black_rating
    }) ${move_data.event ? move_data.event : ""}`;
    setCommentToAdd(comment);
  };

  useEffect(() => {
    if (commentToAdd.length) {
      addCommentToMove(activeMove, commentToAdd, null);
      setCommentToAdd('');
    }
  }, [activeMove]);

  const setGameHandler = (move_data) => {
    setSearchMoveFen(fen);
    addPgnToArr(move_data.pgn, {});
    const newTabName = `${move_data.white_name} - ${move_data.black_name}`;
    changeTabName(newTabName, allPgnArr.length - 1);
    if (tourType === 'study' && tourStepNumber === 2) {
      setTourNumber(-1);
      setTourType('');
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

  const [order, setOrder] = useState({
    whiteEloOrder: 0,
    blackEloOrder: 0,
    yearOrder: -1,
  });

  const whiteEloOrderHandler = (searchParams) => {
    const orderType = order.whiteEloOrder === -1 ? 1 : -1;
    setOrder({ whiteEloOrder: orderType, blackEloOrder: 0, yearOrder: 0 });
    setGameReference(false, {
      ...searchParams,
      order_by: 'white_rating',
      order: orderType,
    });
  };

  const blackEloOrderHandler = (searchParams) => {
    const orderType = order.blackEloOrder === -1 ? 1 : -1;
    setOrder({ whiteEloOrder: 0, blackEloOrder: orderType, yearOrder: 0 });
    setGameReference(false, {
      ...searchParams,
      order_by: 'black_rating',
      order: orderType,
    });
  };

  const yearOrderHandler = (searchParams) => {
    const orderType = order.yearOrder === -1 ? 1 : -1;
    setOrder({ whiteEloOrder: 0, blackEloOrder: 0, yearOrder: orderType });
    setGameReference(false, {
      ...searchParams,
      order_by: 'date',
      order: orderType,
    });
  };

  const orderImgHandler = (order) => {
    if (order === 1) {
      return ACTIVE_ASCENDING;
    } else if (order === -1) {
      return ACTIVE_DESCENDING;
    } else {
      return INACTIVE_DESCENDING;
    }
  };

  const loadMoreHandler = () => {
    if (!scrollIndx) setScrollIndx(referenceGames.games.length - 5);
    setLoader('gameRefMoreLoader');
    setGameReference(true, searchParams);
  };

  useLayoutEffect(() => {
    if (
      pageNum > 0 &&
      scrollIndx &&
      scrollRef &&
      scrollRef.current &&
      referenceGames.games &&
      scrollIndx !== referenceGames.games.length - 5
    ) {
      scrollRef.current.scrollIntoView({ behavior: 'instant' });
      setScrollIndx(referenceGames.games.length - 5);
    }
  }, [referenceGames]);

  const handleContextMenu = (event, move_data) => {
    event.preventDefault();
 
    if(window.innerWidth < 800 ){
      return
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
    setMoveData(move_data);
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

  return (
    <>
      <Table id="gameReference" className="scroll game-ref-tb" hover>
        <thead>
          <tr>
            <th className="names">White</th>
            <th
              className="sortParams small-row"
              onClick={() => whiteEloOrderHandler(searchParams)}
            >
              Elo
              <img
                height={18}
                src={orderImgHandler(order.whiteEloOrder)}
                alt=""
              />
            </th>
            <th className="names">Black</th>
            <th
              className="sortParams small-row"
              onClick={() => blackEloOrderHandler(searchParams)}
            >
              Elo
              <img
                height={18}
                src={orderImgHandler(order.blackEloOrder)}
                alt=""
              />
            </th>
            <th className="small-row">Result</th>
            <th
              className="sortParams small-row  small-row-dt"
              onClick={() => yearOrderHandler(searchParams)}
            >
              Date
              <img height={18} src={orderImgHandler(order.yearOrder)} alt="" />
            </th>
            <th className="medium-row">Tournament</th>
            <th className="big-row">Notation</th>
          </tr>
        </thead>
        <tbody>
          {loader === 'gameRefLoader' ? (
            <tr className="isLoading">
              <td>
                <div className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </td>
            </tr>
          ) : (
            <></>
          )}
          {loader !== 'gameRefLoader' &&
          referenceGames &&
          referenceGames.games ? (
            referenceGames.games.map((move_data, indx) => {
              const next_moves = getPgnData(fen, move_data.pgn);
              const itemProps = indx === scrollIndx ? { ref: scrollRef } : {};
              return (
                <tr
                  className="game-reference-line"
                  key={move_data.id * Math.random()}
                  onClick={() => {
                    setGameHandler(move_data);
                  }}
                  onContextMenu={(e) => {
                    handleContextMenu(e, move_data);
                  }}
                  {...itemProps}
                >
                  <td className="names" title={move_data.white_name}>
                    {move_data.white_name}
                  </td>
                  <td className="small-row">{move_data.white_rating}</td>
                  <td className="names" title={move_data.black_name}>
                    {move_data.black_name}
                  </td>
                  <td className="small-row">{move_data.black_rating}</td>
                  <td className="small-row">
                    {convertResult(move_data.result)}
                  </td>
                  <td className="small-row small-row-dt">
                    {move_data.date.replaceAll('-', '/')}
                  </td>
                  <td className="medium-row" title={move_data.event}>
                    {move_data.event}
                  </td>
                  <td
                    className="pgn-ref big-row"
                    title={move_data.pgn.substring(
                      move_data.pgn.indexOf(`\n1. `)
                    )}
                  >
                    {next_moves}
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          {loader !== 'gameRefLoader' &&
            referenceGames &&
            referenceGames.message && (
              <tr className="game-reference-line" key="reference-message">
                <td className="noGames">{referenceGames.message}</td>
              </tr>
            )}

          {loader !== 'gameRefLoader' &&
          referenceGames &&
          referenceGames.games &&
          referenceGames.games.length &&
          !referenceGames.message ? (
            loader === 'gameRefMoreLoader' ? (
              <tr className="isLoading moreLoader">
                <td>
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td onClick={loadMoreHandler}>
                  <button className="more-btn">more</button>
                </td>
              </tr>
            )
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
    </>
  );
};

export default connect(mapStateToProps, {
  setGameReference,
  setLoader,
  setTourNumber,
  setTourType,
  addPgnToArr,
  changeTabName,
  setActiveMove,
  doMove,
  addCommentToMove,
})(GameReference);
