import React, { useEffect, useRef, useState } from 'react';
import {
  checkForMainLineVariation,
  getMoveFullInfo,
  checkSubravs,
  getLineIndexLetter,
  getMovesLine,
  getRowContainingMove,
} from '../../utils/pgn-viewer';
import { cloneDeep } from 'lodash';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import Chess from 'chess.js';
import useKeyPress from './KeyPress';
import PreviewActiveVarOptionsModal from './PreviewActiveVarOptionsModal';

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
          style={{ border: 'none', marginLeft: indx === 0 ? 0 : 8 }}
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
                    marginLeft: openParenthesis ? 0 : 8,
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
          className={`${
            activeMove && move.move_id === activeMove.move_id
              ? 'active'
              : 'non-active'
          } ${move.type && move.type.length ? move.type : ''}`}
          style={{ border: 'none', marginLeft: 8 }}
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

const PreviewVariations = (props) => {
  const {
    pgn,
    activeMove,
    pgnStr,
    setPreviewFen,
    setPreviewActiveMV,
    activeVarOpt,
    setActiveVarOpt,
  } = props;
  const symbolModeEnabled = false;

  const leftKey = useKeyPress(37);
  const rightKey = useKeyPress(39);
  const [nextMove, setNextMove] = useState();

  const moves = pgn && pgn.moves ? cloneDeep(pgn.moves) : [];

  const scrollRef = useRef();

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 35,
  });

  const setActiveMove = (activeMove) => {
    const chess = new Chess();
    chess.load_pgn(pgnStr);
    if (
      Object.keys(chess.header()).length === 0 &&
      chess.header().constructor === Object
    ) {
      chess.header('White', 'Player 1', 'Black', 'Player 2');
    }

    const pgn = chess.pgn();
    const linePgn = pgn.split('\n\n');

    if (!activeMove) {
      linePgn[1] = '*';
      const isSet = chess.load_pgn(linePgn.join('\n\n'), {
        sloppy: true,
      });
      if (!isSet) {
        throw new Error("PGN parsed, but can't load into chess.js");
      }
      const fen = chess.fen();
      setPreviewActiveMV(activeMove);
      setPreviewFen(fen);
      return;
    }

    const moves = [];
    getMovesLine({ ...activeMove }, moves);

    let movesStr = '';
    moves.forEach(
      (mv) =>
        (movesStr += `${mv.move_number ? mv.move_number + '. ' : ''}${
          mv.move
        } `)
    );
    linePgn[0] = linePgn[0].split('\n ')[0];
    linePgn[1] = !movesStr.includes('undefined') ? movesStr : ' *';

    console.log('LINE PGN: ', linePgn);
    const isSet = chess.load_pgn(linePgn.join('\n\n'), {
      sloppy: true,
    });

    if (!isSet) {
      throw new Error("PGN parsed, but can't load into chess.js");
    }

    const fen = chess.fen();
    setPreviewActiveMV(activeMove);
    setPreviewFen(fen);
  };

  useEffect(() => {
    if (!leftKey) {
      if (!activeMove || !activeMove.prev_move) return;
      setActiveMove(activeMove.prev_move);
    }
  }, [leftKey]);

  useEffect(() => {
    if (!rightKey) {
      if (!pgn.moves) return;

      if (!activeMove) {
        if (pgn.moves && pgn.moves[0]) setActiveMove(pgn.moves[0]);
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
  }, [rightKey]);

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
            const directActive =
              child.type === 'button' &&
              child.props &&
              child.props.className &&
              child.props.className.includes('active') &&
              !child.props.className.includes('non-active');
            const childActive =
              child.type === 'span' &&
              child.props.children.props &&
              child.props.children.props.className &&
              child.props.children.props.className.includes('active') &&
              !child.props.children.props.className.includes('non-active');
            if (directActive || childActive) {
              setRowIndx(indx);
            } else if (
              child.type === 'span' &&
              child.props.children &&
              child.props.children.length &&
              typeof child.props.children !== 'string'
            ) {
              child.props.children.forEach((subChild) => {
                if (
                  subChild.props.className &&
                  subChild.props.className.includes('active') &&
                  !subChild.props.className.includes('non-active')
                ) {
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
    if (rowIndx !== null) {
      scrollRef.current.scrollToRow(rowIndx);
      setRowIndx(null);
    }
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
    <div className="variations-container" style={{ resize: 'none' }}>
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
      {activeVarOpt && (
        <PreviewActiveVarOptionsModal
          isOpen={activeVarOpt}
          setIsOpen={setActiveVarOpt}
          nextMove={nextMove}
          setActiveMove={setActiveMove}
        />
      )}
    </div>
  );
};

export default PreviewVariations;
