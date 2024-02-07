import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { setMoveLoader, setLoader, setLichessDB } from '../../actions/board';
import { connect } from 'react-redux';
import Select, { components } from 'react-select';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    searchParamsLichess: state.board.searchParamsLichess,
  };
};

const InputOption = ({
  getStyles,
  Icon,
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}) => {
  const [isActive, setIsActive] = useState(false);
  const onMouseDown = () => setIsActive(true);
  const onMouseUp = () => setIsActive(false);
  const onMouseLeave = () => setIsActive(false);

  let bg = 'transparent';
  if (isFocused) bg = '#eee';
  if (isActive) bg = '#358c65';

  const style = {
    alignItems: 'center',
    backgroundColor: bg,
    color: 'inherit',
    display: 'flex ',
    width: '100%',
    height: '30px',
  };

  const props = {
    ...innerProps,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    style,
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      getStyles={getStyles}
      innerProps={props}
    >
      <input type="checkbox" checked={isSelected} style={{ marginRight: 5 }} />
      {children}
    </components.Option>
  );
};

const timeControl = [
  { value: 'ultraBullet', label: 'Ultra Bullet' },
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
  { value: 'classical', label: 'Classical' },
  { value: 'correspondence', label: 'Correspondence' },
];

const averageRating = [
  { value: '400', label: '400' },
  { value: '1000', label: '1000' },
  { value: '1200', label: '1200' },
  { value: '1400', label: '1400' },
  { value: '1600', label: '1600' },
  { value: '1800', label: '1800' },
  { value: '2000', label: '2000' },
  { value: '2200', label: '2200' },
  { value: '2500', label: '2500' },
];

const SearchLichessModal = ({
  isOpen,
  setIsOpen,
  searchParamsLichess,
  setLoader,
  setLichessDB,
}) => {
  const [userInput, setUserInput] = useState(searchParamsLichess);
  const [optionsTime, setOptionsTime] = useState([]);
  const [optionsRating, setOptionsRating] = useState([]);

  useEffect(() => {
    setUserInput({ ...userInput, speeds: optionsTime });
  }, [optionsTime]);

  useEffect(() => {
    setUserInput({ ...userInput, ratings: optionsRating });
  }, [optionsRating]);

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleLichessSearch = () => {
    setLichessDB(userInput);
    handleCloseModal();
  };

  const showModalHandler = () => {
    setUserInput({ ...searchParamsLichess });
  };

  return (
    <Modal
      show={isOpen}
      onHide={handleCloseModal}
      onShow={showModalHandler}
      size="lg"
      keyboard={true}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="border-radius-dialog"
    >
      <Modal.Body>
        <div className="d-flex flex-row justify-content-end">
          <button
            className="modal-close modal-close-search"
            type="button"
            onClick={handleCloseModal}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="20"
              height="20"
              alt=""
            />
          </button>
        </div>
        <div className="search-param-body">
          <div className="mt-1">
            <label htmlFor="timeLimit">Time Limit</label>
          </div>
          <div className="d-flex flex-row mt-1">
            <Select
              id="timeLimit"
              defaultValue={timeControl.filter((obj) =>
                searchParamsLichess.speeds.includes(obj.value)
              )}
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              onChange={(options) => {
                if (Array.isArray(options)) {
                  setOptionsTime(options.map((opt) => opt.value));
                }
              }}
              options={timeControl}
              components={{
                Option: InputOption,
              }}
            />
          </div>
          <div className="mt-2">
            <label htmlFor="avgRating">Average Rating</label>
          </div>
          <div className="d-flex flex-row mt-1">
            <Select
              id="avgRating"
              defaultValue={averageRating.filter((obj) =>
                searchParamsLichess.ratings.includes(obj.value)
              )}
              isMulti
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              onChange={(options) => {
                if (Array.isArray(options)) {
                  setOptionsRating(options.map((opt) => opt.value));
                }
              }}
              options={averageRating}
              components={{
                Option: InputOption,
              }}
            />
          </div>
          <div className="lichess-search-grid mt-3">
            <div className="d-flex flex-column">
              <label htmlFor="variant">Variants</label>
              <select
                id="variant"
                className="mt-1 variant-select"
                onChange={(event) => {
                  setUserInput({ ...userInput, variant: event.target.value });
                }}
              >
                <option
                  selected={searchParamsLichess.variant === 'standard'}
                  value="standard"
                >
                  Standard
                </option>
                <option
                  selected={searchParamsLichess.variant === 'chess960'}
                  value="chess960"
                >
                  Chess960
                </option>
                <option
                  selected={searchParamsLichess.variant === 'crazyhouse'}
                  value="crazyhouse"
                >
                  Crazy House
                </option>
                <option
                  selected={searchParamsLichess.variant === 'antichess'}
                  value="antichess"
                >
                  Antichess
                </option>
                <option
                  selected={searchParamsLichess.variant === 'atomic'}
                  value="atomic"
                >
                  Atomic
                </option>
                <option
                  selected={searchParamsLichess.variant === 'horde'}
                  value="horde"
                >
                  Horde
                </option>
                <option
                  selected={searchParamsLichess.variant === 'kingOfTheHill'}
                  value="kingOfTheHill"
                >
                  King of the Hill
                </option>
                <option
                  selected={searchParamsLichess.variant === 'racingKing'}
                  value="racingKing"
                >
                  Racing King
                </option>
                <option
                  selected={searchParamsLichess.variant === 'threeCheck'}
                  value="threeCheck"
                >
                  Three Check
                </option>
                <option
                  selected={searchParamsLichess.variant === 'fromPosition'}
                  value="fromPosition"
                >
                  From Position
                </option>
              </select>
            </div>
            <div className="d-flex flex-column common-mvs">
              <label htmlFor="commonMV">Number of Most Common Moves</label>
              <input
                id="commonMV"
                className="mt-1 lichess-input"
                type="number"
                value={userInput.moves}
                onChange={(event) => {
                  setUserInput({ ...userInput, moves: event.target.value });
                }}
              />
            </div>
          </div>
          <div className="lichess-search-grid mt-3">
            <div className="d-flex flex-column">
              <label htmlFor="since">Since</label>
              <input
                id="since"
                className="mt-1 lichess-input"
                type="month"
                min="1952-01"
                value={userInput.since}
                onChange={(event) => {
                  setUserInput({ ...userInput, since: event.target.value });
                }}
              />
            </div>
            <div className="d-flex flex-column">
              <label htmlFor="until">Until</label>
              <input
                id="until"
                className="mt-1 lichess-input"
                type="month"
                max="3000-12"
                value={userInput.until}
                onChange={(event) => {
                  setUserInput({ ...userInput, until: event.target.value });
                }}
              />
            </div>
          </div>
          <div className="d-flex flex-row justify-content-between mt-5">
            <Button
              className="game-format-btn game-format-close-btn"
              variant="primary"
              onClick={handleCloseModal}
            >
              Close
            </Button>
            <Button
              id="searchFilterBtn"
              className="apply-btn"
              variant="primary"
              onClick={() => {
                handleLichessSearch();
              }}
            >
              Search
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default connect(mapStateToProps, {
  setMoveLoader,
  setLoader,
  setLichessDB,
})(SearchLichessModal);
