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
    document
      .querySelector('.main-board')
      .addEventListener('wheel', (event) => this.handleWheel(event), false);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', (event) =>
      this.handleKeyDown(event)
    );
    document
      .querySelector('.main-board')
      .removeEventListener('wheel', (event) => this.handleWheel(event), false);
  }
  handleWheel = (event) => {
    event.preventDefault();
    var e_delta = event.deltaY || -event.wheelDelta || event.detail;
    var delta = (e_delta && (e_delta >> 10 || 1)) || 0;
    if (delta > 0) {
      this.goToPrevMove();
    } else if (delta < 0) {
      this.goToNextMove();
    }
  };
  handleKeyDown(event) {
    if (
      this.props.activeVarOpt ||
      this.props.activeTab === 5 ||
      this.props.isCommentField ||
      (this.props.editComment && this.props.editComment.id)
    ) {
      return;
    }
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
    const { activeMove, setActiveMove, activeTab } = this.props;
    if (!activeMove || activeTab === 3) return;

    setActiveMove(activeMove.prev_move);
  }

  goToNextMove() {
    const { activeMove, pgn, setActiveMove, activeTab } = this.props;
    if (!pgn.moves || activeTab === 3) return;

    if (!activeMove) {
      setActiveMove(pgn.moves[0]);
      return;
    }

    const row = getRowContainingMove(pgn.moves, activeMove);
    if (!row) return;
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
