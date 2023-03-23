import React from 'react';
import {
  setReference,
  setGameRefLoader,
  setMoveLoader,
  setGameReference,
  setTourNextStep,
} from '../../actions/board';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    searchParams: state.board.searchParams,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
  };
};

const PlayersList = (props) => {
  const {
    playersData,
    setPlayerSearchInput,
    setReference,
    fen,
    searchParams,
    setGameRefLoader,
    setMoveLoader,
    setGameReference,
    tourStepNumber,
    tourType,
    setTourNextStep,
  } = props;
  const handlePlayerSearch = (player) => {
    setPlayerSearchInput(player);
    const newSearchParams = {
      whitePlayer: searchParams.whitePlayer
        ? [...searchParams.whitePlayer, player]
        : [player],
      blackPlayer: searchParams.blackPlayer,
      whiteElo: searchParams.whiteElo,
      blackElo: searchParams.blackElo,
      ignoreColor: true,
      resultWins: searchParams.resultWins,
      resultDraws: searchParams.resultDraws,
      resultLosses: searchParams.resultLosses,
      dateMin: searchParams.dateMin,
      dateMax: searchParams.dateMax,
    };
    setMoveLoader();
    setGameRefLoader();
    setReference(fen, newSearchParams);
    setGameReference(false, newSearchParams);
    setPlayerSearchInput('');
    if (tourType === 'prepare' && tourStepNumber === 1) {
      setTourNextStep();
    }
  };
  return (
    <ul className="player-suggestions">
      {playersData.map((player) => {
        return (
          <li
            key={player.length * Math.random()}
            onClick={() => {
              handlePlayerSearch(player);
            }}
          >
            {player}
          </li>
        );
      })}
    </ul>
  );
};

export default connect(mapStateToProps, {
  setReference,
  setGameRefLoader,
  setMoveLoader,
  setGameReference,
  setTourNextStep,
})(PlayersList);
