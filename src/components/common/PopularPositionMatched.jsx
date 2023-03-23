import React from 'react';
import { connect } from 'react-redux';
import { useEffect } from 'react';
import { matchFenWithPopularPosition } from '../../utils/utils';
import { setMatchedPositionName } from '../../actions/board';
import boardEditordata from '../../utils/board-editor-data';

const mapStateToProps = (state) => {
    return {
        fen: state.board.fen,
        matchedPositionName: state.board.matchedPositionName,
    };
};

const PopularPositionMatched = ({
    fen,
    matchedPositionName,
    setMatchedPositionName,
}) => {

    useEffect(() => {
        const matchedResult = matchFenWithPopularPosition(fen, boardEditordata.positions);

        if (matchedResult) {
            setMatchedPositionName(matchedResult.name)
        }

    }, [fen]);

    return (
        <div className='matched-popular-position'>
            {
                matchedPositionName && <span>{matchedPositionName}</span>
            }
        </div>
    );
};

export default connect(mapStateToProps, { setMatchedPositionName })(PopularPositionMatched);
