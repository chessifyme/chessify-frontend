import React from 'react';
import { connect } from 'react-redux';
import { setActiveMove } from '../../actions/board';
import { getRowContainingMove } from '../../utils/pgn-viewer';

const ARROW_LEFT = 'ArrowLeft';
const ARROW_RIGHT = 'ArrowRight';

const mapStateToProps = (state) => {
  return {
    pgn: state.board.pgn,
    activeMove: state.board.activeMove,
  };
};

class VariationActions extends React.Component {
  componentDidMount() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (this.props.activeVarOpt) return;
    switch (event.key) {
      case ARROW_LEFT: {
        this.goToPrevMove();
        break;
      }
      case ARROW_RIGHT: {
        this.goToNextMove();
        break;
      }
      default: {
        break;
      }
    }
  }

  goToPrevMove() {
    const { activeMove, setActiveMove } = this.props;

    if (!activeMove) return;

    setActiveMove(activeMove.prev_move);
  }

  goToNextMove() {
    const { activeMove, pgn, setActiveMove } = this.props;
    if (!pgn.moves) return;

    if (!activeMove) {
      setActiveMove(pgn.moves[0]);
      return;
    }

    const row = getRowContainingMove(pgn.moves, activeMove);

    const curMoveIndexInRow = row.findIndex(
      (m) => m.move_id === activeMove.move_id
    );

    const nextMove = row[curMoveIndexInRow + 1];

    if (nextMove) {
      if (nextMove.ravs) {
        this.props.setNextMove(nextMove);
        this.props.setActiveVarOpt(true);
      } else {
        setActiveMove(row[curMoveIndexInRow + 1]);
      }
    }
  }

  goToLastMove() {
    const { pgn, setActiveMove } = this.props;

    if (pgn.moves) setActiveMove([...pgn.moves].pop());
  }

  goToFirstMove() {
    const { pgn, setActiveMove } = this.props;

    if (pgn.moves) setActiveMove(pgn.moves[0]);
  }

  render() {
    return null;
  }
}

export default connect(mapStateToProps, { setActiveMove })(VariationActions);
