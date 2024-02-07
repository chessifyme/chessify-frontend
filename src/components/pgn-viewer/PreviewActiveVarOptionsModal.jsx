import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatMoveNumber } from '../../utils/pgn-viewer';
import useKeyPress from './KeyPress';

const PreviewActiveVarOptionsModal = ({
  nextMove,
  isOpen,
  setIsOpen,
  setActiveMove,
}) => {
  const [selectedMove, setSelectedMove] = useState(-1);
  const [firstRightKey, setFirstRightKey] = useState(false);
  const arrowUpPressed = useKeyPress(38);
  const arrowDownPressed = useKeyPress(40);
  const arrowRightPressed = useKeyPress(39);
  const arrowLeftPressed = useKeyPress(37);
  const enterPressed = useKeyPress(13);

  useEffect(() => {
    if (arrowUpPressed && isOpen) {
      arrowUpHandler();
    }
  }, [arrowUpPressed]);

  useEffect(() => {
    if (arrowDownPressed && isOpen) {
      arrowDownHandler();
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    if ((arrowRightPressed || enterPressed) && isOpen) {
      if (firstRightKey) {
        setActiveMoveHandler();
        closeModalHandler();
        return;
      }
      setFirstRightKey(true);
    }
  }, [arrowRightPressed, enterPressed]);

  useEffect(() => {
    if (arrowLeftPressed && isOpen) {
      closeModalHandler();
    }
  }, [arrowLeftPressed]);

  const arrowDownHandler = () => {
    if (selectedMove === nextMove.ravs.length - 1) {
      setSelectedMove(-1);
      return;
    }
    setSelectedMove((selectedMove) => selectedMove + 1);
  };

  const arrowUpHandler = () => {
    if (selectedMove === -1) {
      setSelectedMove(nextMove.ravs.length - 1);
      return;
    }
    setSelectedMove((selectedMove) => selectedMove - 1);
  };

  const setActiveMoveHandler = () => {
    if (selectedMove === -1) {
      setActiveMove(nextMove);
    } else {
      setActiveMove(nextMove.ravs[selectedMove].moves[0]);
    }
  };

  const closeModalHandler = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      show={isOpen}
      onHide={() => {
        setIsOpen(false);
      }}
      keyboard={true}
      backdrop="static"
      aria-labelledby="contained-modal-title-vcenter"
      dialogClassName="border-radius-dialog small-sized-opt"
    >
      <Modal.Body className="modal-body">
        <div className="d-flex flex-row justify-content-end">
          <button
            className="modal-close rav-opt-close"
            type="button"
            onClick={closeModalHandler}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="20"
              height="20"
              alt=""
            />
          </button>
        </div>
        <div className="d-flex flex-column justify-content-center">
          <Button
            className={`white-button rav-opt ${
              selectedMove === -1 ? 'selected-rav-opt' : ''
            }`}
            variant="primary"
            onClick={() => {
              setSelectedMove(-1);
              setActiveMove(nextMove);
              closeModalHandler();
            }}
          >
            A&#x29;
            {nextMove.move_number
              ? ` ${nextMove.move_number}. `
              : ` ${nextMove.prev_move.move_number}... `}
            {nextMove.move}
          </Button>
          {nextMove.ravs.map((rv, index) => {
            return (
              <Button
                className={`white-button rav-opt ${
                  selectedMove === index ? 'selected-rav-opt' : ''
                }`}
                key={index * Math.random()}
                variant="primary"
                onClick={() => {
                  setSelectedMove(index);
                  setActiveMove(rv.moves[0]);
                  closeModalHandler();
                }}
              >
                {String.fromCharCode(66 + index) + ') '}
                {formatMoveNumber(rv.moves[0])}
                {rv.moves[0].move}
              </Button>
            );
          })}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PreviewActiveVarOptionsModal;
