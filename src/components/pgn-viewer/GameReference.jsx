import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import {
  setGameReference,
  setPgn,
  setGameRefLoader,
  setTourType,
  setTourNumber,
  addPgnToArr,
  changeTabName,
} from '../../actions/board';
import { convertResult } from '../../utils/pgn-viewer';
import { getPgnData } from '../../utils/chess-utils';

const ACTIVE_DESCENDING = require('../../../public/assets/images/pgn-viewer/active-descending.svg');
const INACTIVE_DESCENDING = require('../../../public/assets/images/pgn-viewer/inactive-descending.svg');
const ACTIVE_ASCENDING = require('../../../public/assets/images/pgn-viewer/active-ascending.svg');

const mapStateToProps = (state) => {
  return {
    referenceData: state.board.referenceData,
    referenceGames: state.board.referenceGames,
    gameRefLoader: state.board.gameRefLoader,
    searchParams: state.board.searchParams,
    pageNum: state.board.pageNum,
    fen: state.board.fen,
    allPgnArr: state.board.allPgnArr,
  };
};

const GameReference = ({
  referenceGames,
  gameRefLoader,
  searchParams,
  setGameReference,
  setGameRefLoader,
  setActiveTab,
  fen,
  tourType,
  tourStepNumber,
  setTourNumber,
  setTourType,
  addPgnToArr,
  allPgnArr,
  changeTabName,
}) => {
  const setGameHandler = (move_data) => {
    setActiveTab(0);
    addPgnToArr(move_data.pgn, {});
    const newTabName = `${move_data.white_name} - ${move_data.black_name}`;
    changeTabName(newTabName, allPgnArr.length - 1);
    if (tourType === 'study' && tourStepNumber === 2) {
      setTourNumber(-1);
      setTourType('');
    }
  };

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
    setGameRefLoader(true);
    setGameReference(true, searchParams);
  };

  return (
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
        {gameRefLoader ? (
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
        {!gameRefLoader && referenceGames && referenceGames.games ? (
          referenceGames.games.map((move_data) => {
            const { title, pgnWithoutHeader, pgnNextMoves } = getPgnData(
              move_data.pgn,
              fen
            );
            return (
              <tr
                className="game-reference-line"
                key={move_data.id * Math.random()}
                onClick={() => {
                  setGameHandler(move_data);
                }}
              >
                <td className="names" title={move_data.white_name}>
                  {move_data.white_name}
                </td>
                <td className="small-row">{move_data.white_rating}</td>
                <td className="names" title={move_data.black_name}>
                  {move_data.black_name}
                </td>
                <td className="small-row">{move_data.black_rating}</td>
                <td className="small-row">{convertResult(move_data.result)}</td>
                <td className="small-row small-row-dt">
                  {move_data.date.replaceAll('-', '/')}
                </td>
                <td className="medium-row" title={title}>
                  {title}
                </td>
                <td className="pgn-ref big-row" title={pgnWithoutHeader}>
                  {pgnNextMoves}
                </td>
              </tr>
            );
          })
        ) : (
          <></>
        )}
        {!gameRefLoader && referenceGames && referenceGames.message && (
          <tr className="game-reference-line" key="reference-message">
            <td className="noGames">{referenceGames.message}</td>
          </tr>
        )}

        {!gameRefLoader &&
        referenceGames &&
        referenceGames.games &&
        referenceGames.games.length &&
        !referenceGames.message ? (
          <tr>
            <td onClick={loadMoreHandler}>
              <button className="more-btn">more</button>
            </td>
          </tr>
        ) : (
          <></>
        )}
      </tbody>
    </Table>
  );
};

export default connect(mapStateToProps, {
  setGameReference,
  setGameRefLoader,
  setTourNumber,
  setTourType,
  addPgnToArr,
  changeTabName,
})(GameReference);
