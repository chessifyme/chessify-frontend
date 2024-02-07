import React, { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { connect } from 'react-redux';
import { doMove, setLichessDB } from '../../actions/board';
import { findNextMoveNumFromFen } from '../../utils/chess-utils';
import SearchLichessModal from './SearchLichessModal';
import LichessDatabaseGameRef from './LichessDatabaseGameRef';
import SearchLichessPlayerModal from './SearchLichessPlayerModal';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    lichessDB: state.board.lichessDB,
    moveLoader: state.board.moveLoader,
    searchParamsLichessPlayer: state.board.searchParamsLichessPlayer,
    searchParamsLichess: state.board.searchParamsLichess,
  };
};

const LichessDatabase = ({
  fen,
  moveLoader,
  lichessDB,
  doMove,
  setLichessDB,
  searchParamsLichessPlayer,
  searchParamsLichess,
  isLoading,
  setIsLoading,
}) => {
  const [response, setResponse] = useState();
  const [searchPlayerName, setSearchPlayerName] = useState(
    searchParamsLichessPlayer.player
  );
  const [playerColor, setPlayerColor] = useState(
    searchParamsLichessPlayer.color
  );
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [openSearchPlayerModal, setOpenSearchPlayerModal] = useState(false);

  useEffect(() => {
    setResponse(lichessDB);
  }, [lichessDB, searchParamsLichessPlayer]);

  const findLichessPlayerHandler = () => {
    if (searchPlayerName.length) {
      let newSearchParams = {
        ...searchParamsLichessPlayer,
        player: searchPlayerName,
        color: playerColor,
      };
      setLichessDB(newSearchParams, setIsLoading);
    }
  };

  const removeLichessPlayerHandler = () => {
    setPlayerColor('white');
    setSearchPlayerName('');
    setLichessDB(searchParamsLichess);
  };

  return (
    <div className="scroll mv-ref-table lichess-db-tb">
      <SearchLichessModal
        isOpen={openSearchModal}
        setIsOpen={setOpenSearchModal}
      />
      <SearchLichessPlayerModal
        isOpen={openSearchPlayerModal}
        setIsOpen={setOpenSearchPlayerModal}
        setIsLoading={setIsLoading}
      />
      <div className="d-flex flex-row justify-content-between mt-2 mb-2">
        <div className="d-flex flex-row">
          <img
            src={require('../../../public/assets/images/pgn-viewer/reference-inactive.svg')}
            className="quick-search-img"
            width={24}
            height={24}
            alt=""
          />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name..."
            value={searchPlayerName}
            onChange={(event) => {
              setSearchPlayerName(event.target.value);
            }}
          />
          <select
            className="lichess-db-color"
            onChange={(event) => setPlayerColor(event.target.value)}
          >
            <option selected={searchParamsLichessPlayer.color === 'white'}>
              white
            </option>
            <option selected={searchParamsLichessPlayer.color === 'black'}>
              black
            </option>
          </select>
          {isLoading ? (
            <div className="d-flex flex-row loading-lichess">
              <div className="circle-loader"></div> {isLoading}
            </div>
          ) : (
            <button
              className="search-lichess-player"
              onClick={() => findLichessPlayerHandler()}
            >
              Find
            </button>
          )}
          {!isLoading &&
          searchParamsLichessPlayer.player &&
          searchParamsLichessPlayer.player.length ? (
            <button
              className="remove-lichess-player"
              onClick={() => removeLichessPlayerHandler()}
            >
              Remove
            </button>
          ) : (
            <></>
          )}
        </div>
        <div>
          <button
            className="filtered-search search-btn"
            onClick={() => {
              if (
                searchParamsLichessPlayer.player &&
                searchParamsLichessPlayer.player.length
              ) {
                setOpenSearchPlayerModal(true);
              } else {
                setOpenSearchModal(true);
              }
            }}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/filter.svg')}
              width={24}
              height={24}
              alt=""
            />
          </button>
        </div>
      </div>
      <Table hover>
        <thead>
          <tr>
            <th className="sm-mv-ref-row">Move</th>
            <th>Games</th>
            <th>Elo Avg.</th>
            <th>1-0</th>
            <th>½-½</th>
            <th>0-1</th>
          </tr>
        </thead>
        <tbody>
          {response && response.moves ? (
            response.moves.map((move) => {
              return (
                <tr
                  className="move-reference-line"
                  key={Math.random()}
                  onClick={() => {
                    doMove(move.san);
                  }}
                >
                  <td className="sm-mv-ref-row">
                    <b>
                      {findNextMoveNumFromFen(fen)}
                      {move.san}
                    </b>
                  </td>
                  <td>{move.white + move.black + move.draws}</td>
                  <td>{move.averageRating}</td>
                  <td>
                    {Math.round(
                      (move.white * 100) /
                        (move.white + move.black + move.draws)
                    )}
                    %
                  </td>
                  <td>
                    {100 -
                      Math.round(
                        (move.white * 100) /
                          (move.white + move.black + move.draws)
                      ) -
                      Math.round(
                        (move.black * 100) /
                          (move.white + move.black + move.draws)
                      )}
                    %
                  </td>
                  <td>
                    {Math.round(
                      (move.black * 100) /
                        (move.white + move.black + move.draws)
                    )}
                    %
                  </td>
                </tr>
              );
            })
          ) : (
            <></>
          )}
          {!moveLoader ? (
            <tr className="move-reference-line" key="no-moves">
              <td className="noGames">{}</td>
            </tr>
          ) : (
            <></>
          )}
        </tbody>
      </Table>
      <LichessDatabaseGameRef lichessDB={response} />
    </div>
  );
};

export default connect(mapStateToProps, { doMove, setLichessDB })(
  LichessDatabase
);
