import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PopularPositionMatched from '../common/PopularPositionMatched';
import { setActiveMove } from '../../actions/board';
import {
  checkForMainLineVariation,
  getMoveFullInfo,
  checkSubravs,
  getLineIndexLetter,
} from '../../utils/pgn-viewer';
import { cloneDeep } from 'lodash';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';

const mapStateToProps = (state) => {
  return {
    pgn: state.board.pgn,
    activeMove: state.board.activeMove,
  };
};

const getPgnRavLines = (
  moves,
  activeMove,
  setActiveMove,
  appendCurrentLineComponents,
  container,
  parentIndex = '',
  symbolModeEnabled
) => {
  moves.forEach((move, indx) => {
    if (move.ravs && checkSubravs(move)) {
      let moveRavs = move.ravs;
      let remainingMoves = moves.splice(indx);
      if (!remainingMoves[0].move_number) {
        remainingMoves[0].move_number =
          remainingMoves[0].prev_move.move_number + '..';
      }
      remainingMoves = { moves: remainingMoves, result: null };
      delete remainingMoves.moves[0].ravs;
      let moveRavsAndRemaining = [...moveRavs, remainingMoves];

      moveRavsAndRemaining.forEach((moveRav, index) => {
        const lineIndex = getLineIndexLetter(index, parentIndex);
        let indent = lineIndex.length + 1;
        container = [];
        container.push(
          <span key={indent * Math.random()}>{lineIndex + ') '}</span>
        );
        appendCurrentLineComponents(container, indent);
        getPgnRavLines(
          moveRav.moves,
          activeMove,
          setActiveMove,
          appendCurrentLineComponents,
          container,
          lineIndex,
          symbolModeEnabled
        );
        container = [];
      });
    } else {
      const {
        moveNumber,
        movePiece,
        moveDirection,
        moveNags,
        moveComments,
      } = getMoveFullInfo(move, symbolModeEnabled);
      container.push(
        <button
          id={move.move_id}
          key={move.move_id}
          onClick={() => setActiveMove(move)}
          className={
            activeMove && move.move_id === activeMove.move_id ? 'active' : ''
          }
          style={{ border: 'none', marginLeft: indx === 0 ? 0 : 10 }}
        >
          {moveNumber}
          {movePiece && (
            <span className={symbolModeEnabled ? 'symbol' : 'not'}>
              {movePiece}
            </span>
          )}
          {moveDirection && <span>{moveDirection}</span>}
          <span className="nags">
            {moveNags.endsWith('.svg') ? (
              <img src={moveNags} height={12} width={12} alt="" />
            ) : (
              moveNags
            )}
          </span>
          <span className="comments">{moveComments}</span>
        </button>
      );
      if (move.ravs && !checkSubravs(move)) {
        move.ravs.forEach((moves, index) => {
          moves.moves.forEach((mv, indx) => {
            const {
              moveNumber,
              movePiece,
              moveDirection,
              moveNags,
              moveComments,
            } = getMoveFullInfo(mv, symbolModeEnabled);
            const openParenthesis = index === 0 && indx === 0;
            const semicolumn =
              indx === moves.moves.length - 1 && move.ravs[index + 1];
            const closeParenthesis =
              indx === moves.moves.length - 1 && index === move.ravs.length - 1;
            container.push(
              <span key={mv.move_id}>
                <span>{openParenthesis ? ' (' : ''}</span>
                <button
                  id={mv.move_id}
                  onClick={() => setActiveMove(mv)}
                  className={
                    activeMove && mv.move_id === activeMove.move_id
                      ? 'active'
                      : ''
                  }
                  style={{
                    border: 'none',
                    marginLeft: openParenthesis ? 0 : 10,
                  }}
                >
                  {moveNumber}
                  {movePiece && (
                    <span className={symbolModeEnabled ? 'symbol' : 'not'}>
                      {movePiece}
                    </span>
                  )}
                  {moveDirection && <span>{moveDirection}</span>}
                  <span className="nags">
                    {moveNags.endsWith('.svg') ? (
                      <img src={moveNags} height={12} width={12} alt="" />
                    ) : (
                      moveNags
                    )}
                  </span>
                  <span className="comments">{moveComments}</span>
                </button>
                <span>{semicolumn ? ';' : ''}</span>
                <span>{closeParenthesis ? ')' : ''}</span>
              </span>
            );
          });
        });
      }
    }
  });
};

const getPgnLines = (
  moves,
  activeMove,
  setActiveMove,
  symbolModeEnabled,
  container = [],
  componentsLines = []
) => {
  if (!moves.length) return [];
  const hasVariation = checkForMainLineVariation(moves);

  const appendCurrentLineComponents = (container, indent) => {
    if (!container.length) return;
    const isBold = indent === 0 && hasVariation;
    componentsLines.push(
      <li
        key={componentsLines.length * Math.random()}
        className={`variation-line ${isBold ? 'bold-var-line' : ''}`}
        style={{
          marginLeft: indent * 20,
        }}
      >
        {container}
      </li>
    );
  };

  moves.forEach((move) => {
    const {
      moveNumber,
      movePiece,
      moveDirection,
      moveNags,
      moveComments,
    } = getMoveFullInfo(move, symbolModeEnabled);
    container.push(
      <span key={move.move_id} className="button-var">
        <button
          id={move.move_id}
          onClick={() => setActiveMove(move)}
          className={
            activeMove && move.move_id === activeMove.move_id
              ? 'active'
              : 'non-active'
          }
          style={{ border: 'none', marginLeft: 10 }}
        >
          {moveNumber}
          {movePiece && (
            <span className={symbolModeEnabled ? 'symbol' : 'not'}>
              {movePiece}
            </span>
          )}
          {moveDirection && <span>{moveDirection}</span>}
          <span className="nags">
            {moveNags.endsWith('.svg') ? (
              <img src={moveNags} height={12} width={12} alt="" />
            ) : (
              moveNags
            )}
          </span>
          <span className="comments">{moveComments}</span>
        </button>
      </span>
    );
    if (move.ravs) {
      appendCurrentLineComponents(container, 0);
      container = [];

      move.ravs.forEach((moveRav) => {
        container.push('[');
        appendCurrentLineComponents(container, 1);
        getPgnRavLines(
          moveRav.moves,
          activeMove,
          setActiveMove,
          appendCurrentLineComponents,
          container,
          '',
          symbolModeEnabled
        );
        componentsLines[componentsLines.length - 1].props.children.push(
          <span key={Math.random()}>]</span>
        );
        container = [];
      });
    }
  });
  appendCurrentLineComponents(container, 0);
  return componentsLines;
};

const VariationsNew = (props) => {
  const {
    pgn,
    activeMove,
    setActiveMove,
    symbolModeEnabled,
    setContextmenuCoords,
    showMenu,
    setShowMenu,
  } = props;
  const moves = pgn.moves ? cloneDeep(pgn.moves) : [];

  const scrollRef = useRef();
  const contextRef = useRef(null);

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 25,
  });

  const handleClick = () => {
    if (showMenu) setShowMenu(false);
  };

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    }
  }, [showMenu]);

  const handleContextMenu = (event) => {
    const containerCoords = contextRef.current.getBoundingClientRect();
    const isInContainerX =
      containerCoords.left < event.pageX && containerCoords.right > event.pageX;
    const isInContainerY =
      containerCoords.top < event.pageY && containerCoords.bottom > event.pageY;

    if (!isInContainerX || !isInContainerY) return;

    event.preventDefault();
    const subtructBoardWidth =
      Math.trunc(
        document
          .getElementsByClassName('page-wrapper')[0]
          .getBoundingClientRect().width / 3
      ) + 180;
    let coordX = event.pageX - subtructBoardWidth;
    const coordY = event.pageY - 180;

    let reverse = false;
    const endPoint =
      document
        .getElementsByClassName('dsk-pgn-viewer')[0]
        .getBoundingClientRect().right - subtructBoardWidth;

    if (coordX + 470 > endPoint) {
      coordX -= 256;
      reverse = true;
    }
    setContextmenuCoords({
      x: coordX + 'px',
      y: coordY + 'px',
      reverse: reverse,
    });
    setShowMenu(true);
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      document.addEventListener('contextmenu', handleContextMenu, true);
    }, 1000);

    return () => {
      clearTimeout(identifier);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  });

  const container = getPgnLines(
    moves,
    activeMove,
    setActiveMove,
    symbolModeEnabled
  );
  const [rowIndx, setRowIndx] = useState(container.length);

  useEffect(() => {
    if (activeMove && activeMove.move_id) {
      container.forEach((elem, indx) => {
        if (elem.type === 'li') {
          elem.props.children.forEach((child) => {
            if (
              child.type === 'button' &&
              child.props &&
              child.props.className === 'active'
            ) {
              setRowIndx(indx);
            } else if (
              child.type === 'span' &&
              child.props.children.props &&
              child.props.children.props.className === 'active'
            ) {
              setRowIndx(indx);
            } else if (
              child.type === 'span' &&
              child.props.children &&
              child.props.children.length &&
              typeof child.props.children !== 'string'
            ) {
              child.props.children.forEach((subChild) => {
                if (subChild.props.className === 'active') {
                  setRowIndx(indx);
                }
              });
            }
          });
        }
      });
    }
  }, [activeMove]);

  const rowRenderHandler = () => {
    if (rowIndx !== null) scrollRef.current.scrollToRow(rowIndx);
  };

  const onScrollHandler = () => {
    setRowIndx(null);
  };

  const renderRow = ({ index, key, style, parent }) => {
    return (
      <CellMeasurer
        key={key}
        className={container[index].props.className}
        cache={cache}
        rowIndex={index}
        columnIndex={0}
        parent={parent}
      >
        <div id={index} style={style}>
          {container[index]}
        </div>
      </CellMeasurer>
    );
  };
  return (
    <div ref={contextRef} className="variations-container">
      <PopularPositionMatched />
      <AutoSizer>
        {({ width, height }) => {
          return (
            <List
              ref={scrollRef}
              height={height}
              width={width}
              rowRenderer={renderRow}
              rowCount={container.length}
              deferredMeasurementCache={cache}
              rowHeight={cache.rowHeight}
              onRowsRendered={rowRenderHandler}
              onScroll={onScrollHandler}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default connect(mapStateToProps, {
  setActiveMove,
})(VariationsNew);
