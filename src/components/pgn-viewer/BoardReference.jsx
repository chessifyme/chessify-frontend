import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import SearchFilterModal from './SearchFilterModal';
import GameReference from './GameReference';
import PlayersList from './PlayersList';
import { BrowserView, MobileView } from 'react-device-detect';
import { Modal } from 'react-bootstrap';
import { searchPlayers } from '../../utils/api';
import { modifySearchParam } from '../../utils/pgn-viewer';
import {
  setGameReference,
  setReference,
  setMoveLoader,
  setLoader,
  setTourNextStep,
} from '../../actions/board';

const mapStateToProps = (state) => {
  return {
    searchParams: state.board.searchParams,
    fen: state.board.fen,
    tourStepNumber: state.board.tourStepNumber,
    tourType: state.board.tourType,
  };
};

const BoardReference = ({
  fen,
  searchParams,
  setReference,
  setGameReference,
  setMoveLoader,
  setLoader,
  tourStepNumber,
  tourType,
  setTourNextStep,
}) => {
  const [filterModal, setFileterModal] = useState(false);
  const [playerSearchInput, setPlayerSearchInput] = useState('');
  const [playersData, setPlayersData] = useState([]);
  const [showPlayersList, setShowPlayersList] = useState(false);
  const [mobileViewModal, setMobileViewModal] = useState(false);

  const outsideClickHandler = () => {
    if (showPlayersList) setShowPlayersList(false);
  };

  useEffect(() => {
    if (showPlayersList) {
      document.addEventListener('click', outsideClickHandler);
      return () => {
        document.removeEventListener('click', outsideClickHandler);
      };
    }
  }, [showPlayersList]);

  const handleFilterModal = () => {
    setFileterModal(!filterModal);
    if (tourType === 'prepare' && tourStepNumber === 2) {
      setTimeout(setTourNextStep, 300);
    }
  };

  const searchParamRemoveHandler = (param, fen, searchParams) => {
    let updatedSearchParams = { ...searchParams };
    if (
      (param == 'ignoreColor' ||
        param.includes('result') ||
        param.includes('ignoreBlitzRapid')) &&
      searchParams[param]
    ) {
      updatedSearchParams = {
        ...searchParams,
        [`${param}`]: false,
      };
    } else {
      updatedSearchParams = { ...searchParams, [`${param}`]: '' };
    }
    setMoveLoader(true);
    setLoader('gameRefLoader');
    setReference(fen, updatedSearchParams);
    setGameReference(false, updatedSearchParams);
  };

  const playerRemoveHandler = (param, player, searchParams, fen) => {
    let indx = searchParams[param].indexOf(player);
    searchParams[param].splice(indx, 1);
    let newPlayers = searchParams[param];
    let updatedSearchParams = { ...searchParams, [`${param}`]: newPlayers };
    setMoveLoader(true);
    setLoader('gameRefLoader');
    setReference(fen, updatedSearchParams);
    setGameReference(false, updatedSearchParams);
  };

  const playerSearchInputHandler = (event) => {
    let playerName = event.target.value;
    setPlayerSearchInput(playerName);
    if (playerName.length >= 3) {
      searchPlayers(playerName)
        .then((players) => {
          setPlayersData(players);
          setShowPlayersList(true);
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      setPlayersData([]);
      setShowPlayersList(false);
    }
  };

  return (
    <div>
      <div className="search-reference-section d-flex flex-row justify-content-between">
        <BrowserView>
          <div id="quickSearch" className="quick-search">
            <div id="quickSearchInput" className="d-flex flex-row">
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
                value={playerSearchInput}
                onChange={playerSearchInputHandler}
              />
            </div>
            {playersData.length > 0 && showPlayersList ? (
              <PlayersList
                playersData={playersData}
                setPlayerSearchInput={setPlayerSearchInput}
                setMobileViewModal={setMobileViewModal}
              />
            ) : (
              <></>
            )}
          </div>
        </BrowserView>
        <MobileView>
          <button
            onClick={() => {
              setMobileViewModal(true);
            }}
            style={{ border: 'none' }}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/reference-inactive.svg')}
              className="quick-search-img"
              width={24}
              height={24}
              alt=""
            />
          </button>
          <Modal
            show={mobileViewModal}
            onHide={() => {
              setMobileViewModal(false);
            }}
            keyboard={true}
            backdrop="static"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <div className="d-flex flex-row justify-content-end">
              <button
                className="modal-close rav-opt-close mt-3 mr-1"
                type="button"
                onClick={() => {
                  setMobileViewModal(false);
                }}
              >
                <img
                  src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
                  width="20"
                  height="20"
                  alt=""
                />
              </button>
            </div>
            <div
              className={`quick-search quick-search-mob ${
                playersData.length > 0 && showPlayersList
                  ? 'quick-search-mobile'
                  : ''
              }`}
            >
              <div id="quickSearchInput" className="d-flex flex-row">
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
                  value={playerSearchInput}
                  onChange={playerSearchInputHandler}
                />
              </div>
              {playersData.length > 0 && showPlayersList ? (
                <PlayersList
                  playersData={playersData}
                  setPlayerSearchInput={setPlayerSearchInput}
                  setMobileViewModal={setMobileViewModal}
                />
              ) : (
                <></>
              )}
            </div>
          </Modal>
        </MobileView>
        <div className="d-flex flex-row">
          <ul className="d-flex flex-wrap">
            {searchParams
              ? Object.keys(searchParams).map((key, index) => {
                  return (searchParams[key] && key.includes('result')) ||
                    (searchParams[key] &&
                      searchParams[key].length &&
                      key !== 'order' &&
                      key !== 'order_by') ||
                    (searchParams[key] &&
                      (key === 'ignoreColor' || key === 'ignoreBlitzRapid')) ? (
                    key.includes('Player') ? (
                      searchParams[key].map((player) => {
                        return (
                          <li
                            className="search-param-tag d-flex flex-row"
                            key={index * Math.random()}
                          >
                            <p>
                              {key === 'whitePlayer' ? '\u2658' : '\u265E'}{' '}
                              {player}
                            </p>
                            <button
                              className="tag-close"
                              onClick={() => {
                                playerRemoveHandler(
                                  key,
                                  player,
                                  searchParams,
                                  fen
                                );
                              }}
                            >
                              <img
                                src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
                                width={18}
                                height={18}
                                alt=""
                              />
                            </button>
                          </li>
                        );
                      })
                    ) : (
                      <li
                        className="search-param-tag d-flex flex-row"
                        key={index * Math.random()}
                      >
                        <p>{modifySearchParam(searchParams, key)}</p>
                        <button
                          className="tag-close"
                          onClick={() => {
                            searchParamRemoveHandler(key, fen, searchParams);
                          }}
                        >
                          <img
                            src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
                            width={18}
                            height={18}
                            alt=""
                          />
                        </button>
                      </li>
                    )
                  ) : (
                    <></>
                  );
                })
              : ''}
          </ul>
          <button
            id="advancedSearch"
            className="filtered-search search-btn"
            onClick={handleFilterModal}
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
      <GameReference
        tourStepNumber={tourStepNumber}
        tourType={tourType}
      />
      <SearchFilterModal
        isOpen={filterModal}
        handleModal={setFileterModal}
        tourStepNumber={tourStepNumber}
        tourType={tourType}
        setTourNextStep={setTourNextStep}
      />
    </div>
  );
};

export default connect(mapStateToProps, {
  setReference,
  setGameReference,
  setMoveLoader,
  setLoader,
  setTourNextStep,
})(BoardReference);
