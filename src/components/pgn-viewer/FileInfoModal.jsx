import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { updatePgnTags } from '../../utils/api';

const FileInfoModal = ({
  isOpen,
  setIsOpen,
  editingFile,
  setLoader,
  userInfo,
}) => {
  const [userInput, setUserInput] = useState({
    white: '',
    black: '',
    whiteElo: '',
    blackElo: '',
    ecoCode: '',
    date: '',
    tournament: '',
    round: '',
    subround: '',
    result: '',
    annotator: '',
    source: '',
    whiteTeam: '',
    blackTeam: '',
  });

  useEffect(() => {
    const { info } = editingFile;
    if (!info) return;
    setUserInput({
      white: info.white ? info.white : '',
      black: info.black ? info.black : '',
      whiteElo: info.elo_white ? `${info.elo_white}` : '',
      blackElo: info.elo_black ? `${info.elo_black}` : '',
      ecoCode: info.eco_code ? info.eco_code : '',
      date: info.date ? info.date : '',
      tournament: info.tournament ? info.tournament : '',
      round: info.round ? info.round : '',
      subround: info.subround ? info.subround : '',
      result: info.result ? info.result : '',
      annotator: info.annotator ? info.annotator : '',
      source: info.source ? info.source : '',
      whiteTeam: info.white_team ? info.white_team : '',
      blackTeam: info.black_team ? info.black_team : '',
    });
  }, [editingFile]);

  const [isLoading, setIsLoading] = useState(false);

  const inputHandler = (value, inputField) => {
    let inputObj = {};
    inputObj[`${inputField}`] = value;

    setUserInput({ ...userInput, ...inputObj });
  };

  const closeModalHandler = () => {
    setIsOpen(false);
    clearInputHandler();
  };

  const clearInputHandler = () => {
    setUserInput({
      white: '',
      black: '',
      whiteElo: '',
      blackElo: '',
      ecoCode: '',
      date: '',
      tournament: '',
      round: '',
      subround: '',
      result: '',
      annotator: '',
      source: '',
      whiteTeam: '',
      blackTeam: '',
    });
  };

  const saveChangesHandler = () => {
    setIsLoading(true);
    updatePgnTags(
      editingFile.id,
      editingFile.name,
      userInput,
      userInfo.token
    ).then(() => {
      setIsLoading(false);
      closeModalHandler();
    });
  };

  return (
    <>
      <Modal
        size="lg"
        show={isOpen}
        onHide={closeModalHandler}
        keyboard={true}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="border-radius-dialog"
      >
        <Modal.Body>
          <Tabs>
            <div className="d-flex flex-row justify-content-between file-info-head mb-3 mt-2">
              <TabList className="d-flex flex-row file-info-tabs tab-style--1">
                <Tab className="file-tab">Players and Result</Tab>
                <Tab className="file-tab">Annotaitor and Teams</Tab>
              </TabList>
              <button
                className="modal-close"
                type="button"
                onClick={closeModalHandler}
              >
                <img
                  src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
                  width="30"
                  height="30"
                  alt=""
                />
              </button>
            </div>
            <TabPanel className="d-flex flex-row file-info-mod">
              <div className="file-info-form">
                <div className="file-info-mod-row file-info-wbd">
                  <div className="d-flex flex-column white-input">
                    <label htmlFor="white">White</label>
                    <input
                      id="white"
                      type="text"
                      value={userInput.white}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'white');
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column black-input">
                    <label htmlFor="black">Black</label>
                    <input
                      id="black"
                      type="text"
                      value={userInput.black}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'black');
                      }}
                    />
                  </div>
                  <div className="file-date">
                    <label className="date-label" htmlFor="date">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      min="0"
                      value={userInput.date}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'date');
                      }}
                    />
                  </div>
                </div>
                <div className="file-info-mod-row">
                  <div className="d-flex flex-column">
                    <label htmlFor="tournament">Tournament</label>
                    <input
                      id="tournament"
                      type="text"
                      value={userInput.tournament}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'tournament');
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column">
                    <label htmlFor="round">Round</label>
                    <input
                      id="round"
                      type="text"
                      value={userInput.round}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'round');
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column">
                    <label htmlFor="subround">Subround</label>
                    <input
                      id="subround"
                      type="text"
                      value={userInput.subround}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'subround');
                      }}
                    />
                  </div>
                </div>
                <div className="file-info-mod-row">
                  <div className="d-flex flex-column">
                    <label htmlFor="eco-code">ECO code</label>
                    <input
                      id="eco-code"
                      type="text"
                      value={userInput.ecoCode}
                      onChange={(e) => {
                        inputHandler(e.target.value, 'ecoCode');
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column">
                    <label htmlFor="white-elo">Elo White</label>
                    <input
                      id="white-elo"
                      type="number"
                      value={userInput.whiteElo}
                      onChange={(e) => {
                        inputHandler(`${e.target.value}`, 'whiteElo');
                      }}
                    />
                  </div>
                  <div className="d-flex flex-column">
                    <label htmlFor="black-elo">Elo Black</label>
                    <input
                      id="black-elo"
                      type="number"
                      value={userInput.blackElo}
                      onChange={(e) => {
                        inputHandler(`${e.target.value}`, 'blackElo');
                      }}
                    />
                  </div>
                </div>
                <div className="file-info-mod-row justify-content-start file-results mt-4">
                  <h6>Result</h6>
                  <div className="d-flex flex-row">
                    <input
                      id="resultWins"
                      type="radio"
                      name="result"
                      checked={userInput.result === '1'}
                      onChange={() => {
                        inputHandler('1', 'result');
                      }}
                    />
                    <label htmlFor="resultWins" className="result-label">
                      1-0
                    </label>
                    <input
                      id="resultDraws"
                      type="radio"
                      name="result"
                      checked={userInput.result === '1/2'}
                      onChange={() => {
                        inputHandler('1/2', 'result');
                      }}
                    />
                    <label htmlFor="resultDraws" className="result-label">
                      <sup>1</sup>&frasl;<sub>2</sub>-<sup>1</sup>&frasl;
                      <sub>2</sub>
                    </label>
                    <input
                      id="resultLoss"
                      type="radio"
                      name="result"
                      checked={userInput.result === '0'}
                      onChange={() => {
                        inputHandler('0', 'result');
                      }}
                    />
                    <label htmlFor="resultLoss" className="result-label">
                      0-1
                    </label>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel className="annot-team">
              <div className="file-info-mod-row">
                <div className="d-flex flex-column white-input annot-row-st pr-2">
                  <label htmlFor="annotator">Annotator</label>
                  <input
                    id="annotator"
                    type="text"
                    value={userInput.annotator}
                    onChange={(e) => {
                      inputHandler(e.target.value, 'annotator');
                    }}
                  />
                </div>
                <div className="d-flex flex-column black-input pl-3">
                  <label htmlFor="source">Source</label>
                  <input
                    id="source"
                    type="text"
                    value={userInput.source}
                    onChange={(e) => {
                      inputHandler(e.target.value, 'source');
                    }}
                  />
                </div>
              </div>
              <div className="file-info-mod-row mb-4">
                <div className="d-flex flex-column white-input annot-row-st pr-2">
                  <label htmlFor="white-team">White Team</label>
                  <input
                    id="white-team"
                    type="text"
                    value={userInput.whiteTeam}
                    onChange={(e) => {
                      inputHandler(e.target.value, 'whiteTeam');
                    }}
                  />
                </div>
                <div className="d-flex flex-column black-input pl-3">
                  <label htmlFor="black-team">Black Team</label>
                  <input
                    id="black-team"
                    type="text"
                    value={userInput.blackTeam}
                    onChange={(e) => {
                      inputHandler(e.target.value, 'blackTeam');
                    }}
                  />
                </div>
              </div>
            </TabPanel>
          </Tabs>
          <div className="d-flex flex-row justify-content-between mt-2 file-info-btns">
            <Button
              className="game-format-btn game-format-close-btn"
              variant="primary"
              onClick={() => {
                closeModalHandler();
                setLoader('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="game-format-btn game-format-close-btn"
              variant="primary"
              type="button"
              onClick={() => {
                clearInputHandler();
              }}
            >
              Clear All
            </Button>
            <Button
              className="apply-btn"
              variant="primary"
              type="button"
              onClick={() => {
                saveChangesHandler();
              }}
            >
              {isLoading ? <div className="circle-loader"></div> : <></>}
              Done
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FileInfoModal;
