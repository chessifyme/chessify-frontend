import React from 'react';
import Table from 'react-bootstrap/Table';
import { doMove, setMoveLoader, setReference } from '../../actions/board';
import { setSubModal } from '../../actions/cloud';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    pgnStr: state.board.pgnStr,
    fen: state.board.fen,
    referenceData: state.board.referenceData,
    searchParams: state.board.searchParams,
    moveLoader: state.board.moveLoader,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const MoveReference = ({
  referenceData,
  userFullInfo,
  moveLoader,
  doMove,
  setSubModal,
}) => {
  const handleMoveReferenceClick = (move, doMove) => {
    let splitMove = move.split('.');

    move = splitMove[splitMove.length - 1].trim();
    doMove(move);
  };

  const subToSee = (
    <button
      className="apply-btn"
      onClick={() => {
        setSubModal('reference');
      }}
    >
      Subscribe
    </button>
  );
  
  return (
    <div className="scroll mv-ref-table">
      <Table hover id="moveReference">
        <thead>
          <tr>
            <th className='sm-mv-ref-row'>Move</th>
            <th
              className={
                userFullInfo.subscription &&
                referenceData &&
                referenceData.statistics &&
                referenceData.statistics[0] &&
                referenceData.statistics[0].games_count
                  ? ''
                  : 'left-th'
              }
            >
              Games
            </th>
            <th>Score</th>
            <th
              className={
                userFullInfo.subscription &&
                referenceData &&
                referenceData.statistics &&
                referenceData.statistics[0] &&
                referenceData.statistics[0].games_count
                  ? ''
                  : 'left-th'
              }
            >
              Elo Avg.
            </th>
            <th className="percent-mv-ref">%</th>
            <th>Last Date</th>
          </tr>
        </thead>
        <tbody>
          {moveLoader || !referenceData ? (
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
          {!moveLoader && referenceData && referenceData.statistics ? (
            referenceData.statistics.map((move) => {
              return (
                <tr
                  className="move-reference-line"
                  key={move.games_count * Math.random()}
                  onClick={() => {
                    handleMoveReferenceClick(move.move, doMove);
                  }}
                >
                  <td className='sm-mv-ref-row'>
                    <b>{move.move}</b>
                  </td>
                  <td>
                    {!move.games_count && !userFullInfo.subscription
                      ? subToSee
                      : move.games_count}
                  </td>
                  <td>{move.result[0]}</td>
                  <td>
                    {!move.avg_rating && !userFullInfo.subscription
                      ? subToSee
                      : move.avg_rating}
                  </td>
                  <td className="percent-mv-ref">
                    {isNaN(
                      Math.floor((move.result[0] / move.games_count) * 100)
                    ) && !userFullInfo.subscription
                      ? subToSee
                      : Math.floor((move.result[0] / move.games_count) * 100)}
                  </td>
                  <td>{move.last_date.replaceAll('-', '/')}</td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          {!moveLoader && referenceData && referenceData.message ? (
            <tr className="move-reference-line" key="no-moves">
              <td className="noGames">{referenceData.message}</td>
            </tr>
          ) : (
            <></>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default connect(mapStateToProps, {
  setReference,
  doMove,
  setMoveLoader,
  setSubModal,
})(MoveReference);
