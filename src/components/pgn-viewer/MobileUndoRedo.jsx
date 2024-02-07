import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
    setActiveMove

} from '../../actions/board';

import { getRowContainingMove } from '../../utils/pgn-viewer';

const mapStateToProps = (state) => {
    return {
        activeMove: state.board.activeMove,
        pgn: state.board.pgn,
    };
};

const MobileUndoRedo = (props) => {
    const {
        activeMove,
        pgn,
        setActiveMove,

    } = props;

    const [activeVarOpt, setActiveVarOpt] = useState(false);
    const [nextMove, setNextMove] = useState(null);

    const handleUndo = () => {

        if (!activeMove) return;
        setActiveMove(activeMove.prev_move);
    }
    const handleRedo = () => {

        if (!pgn.moves) {
            return;
        }
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
                setNextMove(nextMove);
                setActiveVarOpt(true);
            } else {
                setActiveMove(row[curMoveIndexInRow + 1]);
            }
        }
    }

    const handleToLastMove = () => {
        if (pgn.moves) setActiveMove([...pgn.moves].pop());
    }

    const handlseToFirstMove = () => {
        if (pgn.moves) setActiveMove(undefined);
    }

    return (
        <>
            <div className="undo-redo-section">
                <button className='to-left' onClick={handlseToFirstMove}>
                    <img src={require('../../../public/assets/images/pgn-viewer/towards-left.svg')} alt="to-left" />
                </button>
                <button className='undo' onClick={handleUndo}>
                    <img src={require('../../../public/assets/images/pgn-viewer/undo.svg')} alt="undo" />
                </button>
                <button className='redo' onClick={handleRedo}>
                    <img src={require('../../../public/assets/images/pgn-viewer/redo.svg')} alt="redo" />
                </button>
                <button className='to-right' onClick={handleToLastMove}>
                    <img src={require('../../../public/assets/images/pgn-viewer/towards-right.svg')} alt="to-rigth" />
                </button>
            </div>
        </>
    )
};

export default connect(mapStateToProps, {
    setActiveMove
})(MobileUndoRedo);
