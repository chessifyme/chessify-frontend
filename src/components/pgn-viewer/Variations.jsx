import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PopularPositionMatched from '../common/PopularPositionMatched';
import { setActiveMove, addCommentToMove } from '../../actions/board';
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
import { FaCheckCircle } from 'react-icons/fa';

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
  symbolModeEnabled,
  handleContextMenu,
  setContextmenuCoords,
  setShowMenu,
  editComment,
  setEditComment,
  refInput,
  refInputText,
  newComment,
  setNewComment,
  addCommentToMove
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
          symbolModeEnabled,
          handleContextMenu,
          setContextmenuCoords,
          setShowMenu,
          editComment,
          setEditComment,
          refInput,
          refInputText,
          newComment,
          setNewComment,
          addCommentToMove
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
        <>
          <button
            id={move.move_id}
            key={move.move_id}
            onClick={() => setActiveMove(move)}
            onContextMenu={(e) =>
              handleContextMenu(
                e,
                setContextmenuCoords,
                setShowMenu,
                setActiveMove,
                move
              )
            }
            className={
              activeMove && move.move_id === activeMove.move_id ? 'active' : ''
            }
            style={{ border: 'none', marginLeft: indx === 0 ? 0 : 8 }}
          >
            <span>{moveNumber}</span>
            {movePiece ? (
              <span className={symbolModeEnabled ? 'symbol' : 'not'}>
                {movePiece}
              </span>
            ) : <></>}
            {moveDirection ? <span>{moveDirection}</span> : <></>}
            <span className="nags">
              {moveNags.endsWith('.svg') ? (
                <img src={moveNags} height={12} width={12} alt="" />
              ) : (
                moveNags
              )}
            </span>
          </button>
          {move.comments &&
            move.comments.map((comment, indx) => {
              let commentsStr = '';
              if (comment.text && comment.text.includes('%eval')) {
                commentsStr += comment.text.replace('%eval ', '');
              } else if (comment.text) {
                commentsStr += comment.text;
              }
              const isEditing =
                editComment &&
                editComment.id &&
                editComment.id === move.move_id &&
                editComment.index == indx;
              return !isEditing ? (
                <button
                  onClick={(e) => {
                    if (e.detail === 2) {
                      setEditComment({
                        id: move.move_id,
                        index: indx,
                      });
                      setNewComment({
                        comment: comment.text,
                        position: comment.text.length - 1,
                      });
                      setActiveMove(move);
                    }
                  }}
                  className="comments"
                  key={indx}
                >
                  {commentsStr}
                </button>
              ) : (
                <div className="notation-wrap" ref={refInput}>
                  <input
                    className="comments-input"
                    ref={refInputText}
                    value={newComment.comment}
                    style={{ width: `${newComment.comment.length * 8}px` }}
                    onChange={(e) => {
                      setNewComment({
                        comment: e.target.value,
                        position: e.target.selectionStart,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCommentToMove(
                          move,
                          newComment.comment,
                          editComment.index
                        );
                        setNewComment({});
                        setEditComment({});
                      }
                    }}
                  />
                  <FaCheckCircle
                    className="comments-check"
                    onClick={() => {
                      addCommentToMove(
                        move,
                        newComment.comment,
                        editComment.index
                      );
                      setNewComment({});
                      setEditComment({});
                    }}
                  />
                </div>
              );
            })}
        </>
      );
      if (move.ravs && !checkSubravs(move)) {
        move.ravs.forEach((moves, index) => {
          moves.moves.forEach((mv, indx) => {
            const {
              moveNumber,
              movePiece,
              moveDirection,
              moveNags,
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
                  onContextMenu={(e) =>
                    handleContextMenu(
                      e,
                      setContextmenuCoords,
                      setShowMenu,
                      setActiveMove,
                      mv
                    )
                  }
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
                  <span>{moveNumber}</span>
                  {movePiece ? (
                    <span className={symbolModeEnabled ? 'symbol' : 'not'}>
                      {movePiece}
                    </span>
                  ) :
                    <></>
                  }

                  {moveDirection ? <span>{moveDirection}</span> : <></>}
                  <span className="nags">
                    {moveNags.endsWith('.svg') ? (
                      <img src={moveNags} height={12} width={12} alt="" />
                    ) : (
                      moveNags
                    )}
                  </span>
                </button>
                {mv.comments &&
                  mv.comments.map((comment, indx) => {
                    let commentsStr = '';
                    if (comment.text && comment.text.includes('%eval')) {
                      commentsStr += comment.text.replace('%eval ', '');
                    } else if (comment.text) {
                      commentsStr += comment.text;
                    }
                    const isEditing =
                      editComment &&
                      editComment.id &&
                      editComment.id === mv.move_id &&
                      editComment.index == indx;
                    return !isEditing ? (
                      <button
                        onClick={(e) => {
                          if (e.detail === 2) {
                            setEditComment({
                              id: mv.move_id,
                              index: indx,
                            });
                            setNewComment({
                              comment: comment.text,
                              position: comment.text.length - 1,
                            });
                            setActiveMove(mv);
                          }
                        }}
                        className="comments"
                        key={indx}
                      >
                        {commentsStr}
                      </button>
                    ) : (
                      <div className="notation-wrap" ref={refInput}>
                        <input
                          className="comments-input"
                          ref={refInputText}
                          style={{
                            width: `${newComment.comment.length * 8}px`,
                          }}
                          value={newComment.comment}
                          onChange={(e) => {
                            setNewComment({
                              comment: e.target.value,
                              position: e.target.selectionStart,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addCommentToMove(
                                mv,
                                newComment.comment,
                                editComment.index
                              );
                              setNewComment({});
                              setEditComment({});
                            }
                          }}
                        />
                        <FaCheckCircle
                          className="comments-check"
                          onClick={() => {
                            addCommentToMove(
                              mv,
                              newComment.comment,
                              editComment.index
                            );
                            setNewComment({});
                            setEditComment({});
                          }}
                        />
                      </div>
                    );
                  })}
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
  handleContextMenu,
  setContextmenuCoords,
  setShowMenu,
  editComment,
  setEditComment,
  refInput,
  refInputText,
  newComment,
  setNewComment,
  addCommentToMove,
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
    const { moveNumber, movePiece, moveDirection, moveNags } = getMoveFullInfo(
      move,
      symbolModeEnabled
    );
    container.push(
      <span key={move.move_id} className="button-var">
        <button
          id={move.move_id}
          onClick={() => setActiveMove(move)}
          onContextMenu={(e) =>
            handleContextMenu(
              e,
              setContextmenuCoords,
              setShowMenu,
              setActiveMove,
              move
            )
          }
          className={`${activeMove && move.move_id === activeMove.move_id
              ? 'active'
              : 'non-active'
            } ${move.type && move.type.length ? move.type : ''}`}
          style={{ border: 'none', marginLeft: 8 }}
        >
          <span>{moveNumber}</span>
          {movePiece ? (
            <span className={symbolModeEnabled ? 'symbol' : 'not'}>
              {movePiece}
            </span>
          ) : <></>}
          {moveDirection ? <span>{moveDirection}</span> : <></>}
          <span className="nags">
            {moveNags.endsWith('.svg') ? (
              <img src={moveNags} height={12} width={12} alt="" />
            ) : (
              moveNags
            )}
          </span>
        </button>
        {move.comments &&
          move.comments.map((comment, indx) => {
            let commentsStr = '';
            if (comment.text && comment.text.includes('%eval')) {
              commentsStr += comment.text.replace('%eval ', '');
            } else if (comment.text) {
              commentsStr += comment.text;
            }
            const isEditing =
              editComment &&
              editComment.id &&
              editComment.id === move.move_id &&
              editComment.index == indx;
            return !isEditing ? (
              <button
                onClick={(e) => {
                  if (e.detail === 2) {
                    setEditComment({
                      id: move.move_id,
                      index: indx,
                    });
                    setNewComment({
                      comment: comment.text,
                      position: comment.text.length - 1,
                    });
                    setActiveMove(move);
                  }
                }}
                key={indx}
                className="comments"
              >
                {commentsStr}
              </button>
            ) : (
              <div className="notation-wrap" ref={refInput} key={indx}>
                <input
                  className="comments-input"
                  ref={refInputText}
                  value={newComment.comment}
                  onChange={(e) => {
                    setNewComment({
                      comment: e.target.value,
                      position: e.target.selectionStart,
                    });
                  }}
                  style={{ width: `${newComment.comment.length * 8}px` }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCommentToMove(
                        move,
                        newComment.comment,
                        editComment.index
                      );
                      setNewComment({});
                      setEditComment({});
                    }
                  }}
                />
                <FaCheckCircle
                  className="comments-check"
                  onClick={() => {
                    addCommentToMove(
                      move,
                      newComment.comment,
                      editComment.index
                    );
                    setNewComment({});
                    setEditComment({});
                  }}
                />
              </div>
            );
          })}
      </span>
    );
    if (move.ravs) {
      appendCurrentLineComponents(container, 0);
      container = [];

      move.ravs.forEach((moveRav) => {
        container.push(<span>[</span>);
        appendCurrentLineComponents(container, 1);
        getPgnRavLines(
          moveRav.moves,
          activeMove,
          setActiveMove,
          appendCurrentLineComponents,
          container,
          '',
          symbolModeEnabled,
          handleContextMenu,
          setContextmenuCoords,
          setShowMenu,
          editComment,
          setEditComment,
          refInput,
          refInputText,
          newComment,
          setNewComment,
          addCommentToMove
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
    fromRef,
    addCommentToMove,
    editComment,
    setEditComment,
    newComment,
    setNewComment,
  } = props;
  const moves = pgn.moves ? cloneDeep(pgn.moves) : [];
  const refInput = useRef(null);
  const refInputText = useRef(null);

  useEffect(() => {
    if (!refInputText.current) return;
    refInputText.current.focus();
    refInputText.current.setSelectionRange(
      newComment.position,
      newComment.position
    );
  }, [newComment]);

  const handleClickOutside = (event) => {
    if (refInput.current && !refInput.current.contains(event.target)) {
      setEditComment({});
      setNewComment({});
    }
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 500);

    return () => {
      clearTimeout(identifier);
      document.removeEventListener('click', handleClickOutside, true);
    };
  });

  const scrollRef = useRef();
  const contextRef = useRef(null);

  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 40,
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

  const handleContextMenu = (
    event,
    setContextmenuCoords,
    setShowMenu,
    setActiveMove,
    move
  ) => {
    event.preventDefault();
    
    if(window.innerWidth < 800 ){
      return
    }
    setActiveMove(move);
    
    const subtructBoardWidth =
      Math.trunc(
        document
          .getElementsByClassName('page-wrapper')[0]
          .getBoundingClientRect().width / 3
      ) + 200;
    let coordX = event.pageX - subtructBoardWidth;
    const coordY = event.pageY - 100;

    let reverse = false;
    const endPoint =
      document
        .getElementsByClassName('dsk-pgn-viewer')[0]
        .getBoundingClientRect().right - subtructBoardWidth;

    if (coordX + 470 > endPoint) {
      coordX -= 275;
      reverse = true;
    }
    setContextmenuCoords({
      x: coordX + 'px',
      y: coordY + 'px',
      reverse: reverse,
    });
    setShowMenu(true);
  };

  const container = getPgnLines(
    moves,
    activeMove,
    setActiveMove,
    symbolModeEnabled,
    handleContextMenu,
    setContextmenuCoords,
    setShowMenu,
    editComment,
    setEditComment,
    refInput,
    refInputText,
    newComment,
    setNewComment,
    addCommentToMove
  );
  const [rowIndx, setRowIndx] = useState(container.length);

  useEffect(() => {
    if (activeMove && activeMove.move_id) {
      container.forEach((elem, indx) => {
        if (elem.type === 'li') {
          elem.props.children.forEach((child) => {
            const childActive =
              child.props &&
              child.props.children &&
              child.props.children[0] &&
              child.props.children[0].props &&
              child.props.children[0].props.id == activeMove.move_id;

            const directActive =
              child.type === 'span' &&
              child.props.children[0].props &&
              child.props.children[0].props.id == activeMove.move_id;

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
                  subChild.props &&
                  subChild.props.id &&
                  subChild.props.id === activeMove.move_id
                ) {
                  setRowIndx(indx);
                }
              });
            }
          });
        }
      });
    }
  }, [activeMove, editComment]);

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
    <div
      ref={contextRef}
      className={`variations-container ${fromRef ? 'shorter-height' : 'normal-height'
        }`}
    >
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
  addCommentToMove,
})(VariationsNew);
