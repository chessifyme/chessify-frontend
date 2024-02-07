import Chess from 'chess.js';
import pgnParser from 'pgn-parser';
import BOARD_ACTION_TYPES from '../constants/board-action-types';
import BOARD_PARAMS, {
  INITIAL_FEN,
  LICHESS_DB_PARAMS,
  LICHESS_DB_PLAYER_PARAMS,
} from '../constants/board-params';
import {
  modifyMoves,
  getMovesLine,
  addMove,
  getPgnString,
  addScorePGN,
  findRootVariations,
  findIndexedPath,
  findLast2MovesOfIndexedPath,
  deleteRemainingMV,
  deleteVarAndReturnParent,
  addNagInPgn,
  deleteMvComment,
  deleteMvNag,
  addCommentToMV,
  getReferencesUrl,
  sortDataByGameCount,
  getPgnHeader,
  findNextMove,
  addScoreToPgnStr,
  fixPgnStrCommentPosition,
  getLinePgn,
  applyFullAnalysisResult,
  addCommandToMV,
  addCommandActiveMove,
  findMove,
  setPgnHeader,
  getPgnMainComments,
} from '../utils/pgn-viewer';
import { setActiveMove } from '../actions/board';
import { CLOUD_URL } from '../constants/cloud-params';
import { findFenMatches } from '../utils/chess-utils';
import {
  getChessAIResponse,
  getLichessDB,
  getLichessDBPlayer,
} from '../utils/api';
import { cloneDeep } from 'lodash';

export function boardMiddleware({ getState, dispatch }) {
  const chess = new Chess();
  chess.header('White', 'Player 1', 'Black', 'Player 2');

  return function (next) {
    return async function (action) {
      console.log('ACTION TYPE:', action.type);
      switch (action.type) {
        ////
        // SET FEN
        ///
        case BOARD_ACTION_TYPES.SET_FEN: {
          try {
            let payloadFen = action.payload.fen;
            payloadFen = payloadFen.trim();
            let res = chess.load(payloadFen);
            if (!res) {
              payloadFen = payloadFen.slice(0, -1) + '1';
              res = chess.load(payloadFen);
              if (!res) {
                return dispatch({
                  type: 'INVALID_FEN',
                  payload: { error: res.error },
                });
              }
            }
            let score = ' *';
            if (chess.game_over() && chess.in_checkmate()) {
              score = chess.turn() === 'w' ? ' 1-0' : ' 0-1';
            } else if (chess.game_over() && chess.in_draw()) {
              score = ' 1/2-1/2';
            }
            const parsedPgn = pgnParser.parse(chess.pgn() + score);

            action.payload.pgnStr = chess.pgn() + score;
            action.payload.pgn = parsedPgn[0];
          } catch (e) {
            console.error('INVALID FEN: ', e);
            return;
          }
          break;
        }

        ////
        // SET INITIAL PGN
        ////
        case BOARD_ACTION_TYPES.SET_INITIAL_PGN: {
          try {
            const parsedPgn = pgnParser.parse(BOARD_PARAMS.INITIAL_PGN_STRING);

            const isSet = chess.load_pgn(BOARD_PARAMS.INITIAL_PGN_STRING);
            if (!isSet)
              throw new Error("PGN parsed, but can't load into chess.js");

            action.payload.pgnStr = chess.pgn();
            action.payload.pgn = parsedPgn[0];

            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'INVALID_INITIAL_PGN',
              payload: { message: 'Invalid initial PGN' },
            });
          }
        }

        ////
        // SET PGN
        ////
        case BOARD_ACTION_TYPES.SET_PGN: {
          try {
            let pgn = action.payload.pgn.trim();
            pgn = addScoreToPgnStr(pgn);
            pgn = fixPgnStrCommentPosition(pgn);
            const parsedPGN = pgnParser.parse(pgn);
            console.log('PARSED PGN: ', parsedPGN);
            // ADDING layer AND prevMove in each move
            modifyMoves(parsedPGN[0].moves);

            let ePgnValue = '';

            if (parsedPGN[0].headers && parsedPGN[0].headers.length) {
              let ePgn = parsedPGN[0].headers.filter(
                (e) => e.name === 'ePGN' || e.name === 'ePgn'
              );
              if (ePgn[0] && ePgn[0].value && ePgn[0].value.length) {
                ePgnValue = ePgn[0].value;
                pgn = pgn.replace(`[ePGN "${ePgnValue}"]`, '').trim();
              }
            }

            const isSet = chess.load_pgn(pgn, { sloppy: true });

            if (!isSet)
              throw new Error("PGN parsed, but can't load into chess.js");

            const lastMainMove = [...parsedPGN[0].moves]
              .reverse()
              .find((m) => m.layer === 0);

            pgn = addScorePGN(pgn, chess);
            action.payload.pgnStr =
              (ePgnValue.length ? `[ePGN "${ePgnValue}"]\n` : '') + pgn;
            action.payload.pgn = parsedPGN[0];
            action.payload.fen = chess.fen();
            action.payload.activeMove = lastMainMove;
            break;
          } catch (e) {
            let pgn = action.payload.pgn.trimEnd();
            if (pgn.includes('[FEN "')) {
              const fen = pgn.split('[FEN "')[1].split('"]')[0];
              return dispatch({
                type: BOARD_ACTION_TYPES.SET_FEN,
                payload: { fen },
              });
            } else {
              console.error(e.message);
              window.alert('Invalid PGN');
              return dispatch({
                type: 'INVALID_PGN',
                payload: { message: 'Invalid PGN' },
              });
            }
          }
        }

        ////
        // DO MOVE
        ////
        case BOARD_ACTION_TYPES.DO_MOVE: {
          try {
            // Getting the Move Number from FEN
            const fenObj = chess.fen().split(' ');
            const move_number = parseInt(fenObj[fenObj.length - 1]);
            const mv = chess.move(action.payload.move);
            if (!mv)
              throw new Error(
                `Invalid move: ${action.payload.move} \n FEN: ${chess.fen()}`
              );

            const boardState = getState().board;
            const { pgn, activeMove, pgnStr } = boardState;

            const moveToAdd = {
              move: mv.san,
              move_number,
              comments: [],
            };

            const curMoves = pgn.moves ? pgn.moves : [];
            const curHeader = pgn.headers ? pgn.headers : [];
            const curComments = getPgnMainComments(pgn.comments);

            const newActiveMove = addMove(curMoves, activeMove, moveToAdd);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStrNew = pgnHeader + curComments + getPgnString(curMoves);
            action.payload.variationOpt =
              newActiveMove.prev_move &&
              newActiveMove.layer !== newActiveMove.prev_move.layer &&
              pgnStr !== pgnStrNew;

            const nextMove = findNextMove(newActiveMove, pgn);
            action.payload.nextMove = nextMove;

            console.log('PGN STRING: ', pgnStrNew);
            action.payload.pgnStr = pgnStrNew;
            action.payload.pgn = { ...pgn, moves: curMoves };
            action.payload.fen = chess.fen();
            action.payload.activeMove = newActiveMove;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'INVALID_MOVE',
              payload: { message: 'Invalid move' },
            });
          }
        }

        ////
        // SET ACTIVE MOVE
        ////
        case BOARD_ACTION_TYPES.SET_ACTIVE_MOVE: {
          try {
            const activeMove = action.payload.activeMove;

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

              action.payload.fen = fen;
              break;
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

            const boardState = getState().board;
            const pgnBoardState = boardState.pgn;

            if (!isSet) {
              throw new Error("PGN parsed, but can't load into chess.js");
            }

            let nextMove = {};
            if (
              !(
                activeMove &&
                Object.keys(activeMove).length === 0 &&
                Object.getPrototypeOf(activeMove) === Object.prototype
              )
            ) {
              nextMove = findNextMove(activeMove, pgnBoardState);
            }

            action.payload.nextMove = nextMove;

            const fen = chess.fen();
            action.payload.fen = fen;

            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'INVALID_PGN',
              payload: { message: 'Invalid PGN' },
            });
          }
        }

        ////
        // PROMOTE VARIATION
        /////
        case BOARD_ACTION_TYPES.PROMOTE_VARIATION: {
          try {
            let move = action.payload.move;
            if (!move || !move.move) {
              console.log('No selected move');
              return;
            }

            console.log('PROMOTION MOVE: ', move);
            if (move.layer === 0) {
              console.log('Already in main line');
              return;
            }
            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);
            console.log('INDEXED PATH: ', indexedPath);
            findLast2MovesOfIndexedPath(pgn, indexedPath);
            console.log('UPDATED PROMOTE: ', pgn);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            setActiveMove(move);
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'PROMOTION_FAILED',
              payload: { message: 'Promotion failed' },
            });
          }
        }

        ////
        // DELETE REMAINING MOVES
        /////

        case BOARD_ACTION_TYPES.DELETE_REMAINING_MOVES: {
          try {
            let move = action.payload.move;
            if (!move.move) {
              console.log('No selected move');
              return;
            }
            console.log('FROM MOVE: ', move);

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);
            console.log('INDEXED PATH: ', indexedPath);

            deleteRemainingMV(pgn, indexedPath);
            console.log('DELETED REMAINING MOVES UPDATE: ', pgn);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            const activeMove = move;

            const moves = [];
            getMovesLine({ ...activeMove }, moves);

            let movesStr = '';
            moves.forEach(
              (mv) =>
                (movesStr += `${mv.move_number ? mv.move_number + '. ' : ''}${
                  mv.move
                } `)
            );

            const isSet = chess.load_pgn(movesStr, { sloppy: true });

            if (!isSet && pgn.headers) {
              pgn.headers.forEach((head) => {
                if (head.name === 'FEN') {
                  chess.load(head.value);
                }
              });
            } else if (!isSet) {
              throw new Error("PGN parsed, but can't load into chess.js");
            }

            const fen = chess.fen();

            action.payload.fen = fen;
            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            action.payload.activeMove = move;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'DELETION_FAILED',
              payload: { message: 'Delete remaining moves failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.DELETE_VARIATION: {
          try {
            let move = action.payload.move;
            if (!move.move) {
              console.log('No selected move');
              return;
            }
            console.log('FROM MOVE: ', move);

            if (move.layer === 0) {
              console.log('Cannot delete main line');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);
            console.log('INDEXED PATH: ', indexedPath);

            let parentMove = deleteVarAndReturnParent(pgn, indexedPath);
            console.log('DELETED VARIATION UPDATE: ', pgn);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            const activeMove = parentMove;

            const moves = [];
            getMovesLine({ ...activeMove }, moves);
            let movesStr = '';
            moves.forEach(
              (mv) =>
                (movesStr += `${mv.move_number ? mv.move_number + '. ' : ''}${
                  mv.move
                } `)
            );
            const isSet = chess.load_pgn(movesStr, { sloppy: true });

            if (!isSet && pgn.headers) {
              pgn.headers.forEach((head) => {
                if (head.name === 'FEN') {
                  chess.load(head.value);
                }
              });
            } else if (!isSet) {
              throw new Error("PGN parsed, but can't load into chess.js");
            }

            const fen = chess.fen();

            const nextMove = findNextMove(move, pgn);

            action.payload.fen = fen;
            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            action.payload.activeMove = activeMove;
            action.payload.nextMove = nextMove;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'VAR_DELETION_FAILED',
              payload: { message: 'Delete variation failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.DELETE_VARIATIONS_AND_COMMENTS: {
          try {
            const boardState = getState().board;
            let { pgn } = boardState;

            pgn.comments = null;
            pgn.comments_above_header = null;
            pgn.moves.forEach((mv) => {
              if (mv.ravs) {
                delete mv.ravs;
              }
              mv.comments = [];
              mv.nags = [];
              delete mv.nags;
            });

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            chess.load_pgn(pgnStr, { sloppy: true });
            const fen = chess.fen();

            const lastMainMove = [...pgn.moves]
              .reverse()
              .find((m) => m.layer === 0);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            action.payload.fen = fen;
            action.payload.activeMove = lastMainMove;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'VAR_COMMENT_DELETION_FAILED',
              payload: { message: 'Delete vars and comments failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.ADD_NAGS: {
          try {
            let move = action.payload.move;
            const nag = action.payload.nag;

            if (!move.move) {
              console.log('No selected move');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            addNagInPgn(pgn, indexedPath, nag);
            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            action.payload.activeMove = move;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'ADDING_NAG_FAILED',
              payload: { message: 'Adding nag failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.DELETE_MOVE_COMMENT: {
          try {
            let move = action.payload.move;

            if (!move.move) {
              console.log('No selected move');
              return;
            }

            if (!move.comments.length) {
              console.log('The move has no comment');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            deleteMvComment(pgn, indexedPath);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'DELETING_MV_COMMENT_FAILED',
              payload: { message: 'Delete move comment failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.DELETE_MOVE_NAG: {
          try {
            let move = action.payload.move;

            if (!move.move) {
              console.log('No selected move');
              return;
            }

            if (!move.nags) {
              console.log('The move has no nags');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            deleteMvNag(pgn, indexedPath);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'DELETING_MV_COMMENT_FAILED',
              payload: { message: 'Delete move comment failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.ADD_COMMENT_TO_MOVE: {
          try {
            let move = action.payload.move;
            const comment = action.payload.comment;
            const commentIndx = action.payload.commentIndx;

            if (!move.move) {
              console.log('No move');
              return;
            }

            if (!comment.length && commentIndx === null) {
              console.log('No text to add');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            addCommentToMV(pgn, indexedPath, comment, commentIndx);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'ADDING_MV_COMMENT_FAILED',
              payload: { message: 'Adding move comment failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.ADD_COMMAND_TO_MOVE: {
          try {
            let move = action.payload.move;
            const command = action.payload.command;

            if (!move.move) {
              console.log('No move');
              return;
            }

            if (
              Object.keys(command).length === 0 &&
              command.constructor === Object
            ) {
              console.log('No command to add');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            addCommandToMV(pgn, indexedPath, command);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);
            action.payload.activeMove = findMove(pgn, indexedPath, false);
            action.payload.pgn = pgn;
            action.payload.pgnStr = pgnStr;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'ADDING_MV_COMMAND_FAILED',
              payload: { message: 'Adding move command failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.ADD_COMMAND_TO_HEADER: {
          try {
            const command = action.payload.command;

            if (
              Object.keys(command).length === 0 &&
              command.constructor === Object
            ) {
              console.log('No command to add');
              return;
            }
            const boardState = getState().board;
            let { pgn } = boardState;
            if (Object.keys(pgn).length === 0 && pgn.constructor === Object) {
              const chessN = new Chess();
              let header = setPgnHeader(chessN.header());
              chess.load_pgn(
                header + `{[%${command.key} ${command.values}]} *`
              );
              const parsedPGN = pgnParser.parse(chess.pgn() + ' *');
              console.log('PARSED PGN: ', parsedPGN);
              // ADDING layer AND prevMove in each move
              modifyMoves(parsedPGN[0].moves);
              action.payload.pgn = parsedPGN[0];
              action.payload.pgnStr =
                header + `{[%${command.key} ${command.values}]} *`;
            } else if (pgn.comments || pgn.comments === null) {
              if (pgn.comments === null) pgn.comments = [];

              addCommandActiveMove(pgn.comments, command, null);
              const curHeader = pgn.headers ? pgn.headers : [];
              const curComments = getPgnMainComments(pgn.comments);
              const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
              const curMoves =
                pgn.moves && pgn.moves.length ? getPgnString(pgn.moves) : [];
              const pgnStrNew = pgnHeader + curComments + curMoves;

              action.payload.pgn = pgn;
              action.payload.pgnStr = pgnStrNew;
            }

            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'ADDING_HEADER_COMMAND_FAILED',
              payload: { message: 'Adding header command failed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_REFERENCE: {
          try {
            let fen = action.payload.fen;
            if (!fen) {
              return;
            }
            let searchParams = action.payload.searchParams;
            let url = getReferencesUrl(fen, searchParams, 'get_references');
            async function getReferences() {
              const response = await fetch(url);
              if (!response.ok) {
                action.payload.moveLoader = false;
                action.payload.referenceData = {};
                action.payload.referenceData['message'] = 'No moves found';
                return;
              }
              let respJson = await response.json();
              let { data, error } = respJson;
              if (data) {
                let statistics = sortDataByGameCount(data);
                action.payload.referenceData = {};
                action.payload.referenceData['statistics'] = statistics;
              } else if (error) {
                action.payload.referenceData = {};
                action.payload.referenceData['message'] = error;
              }
            }
            await getReferences();
            action.payload.moveLoader = false;
            action.payload.searchParams = searchParams;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'SETTING_REFERENCE_FAILED',
              payload: { message: 'Failed setting reference' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_GAME_REFERENCE: {
          try {
            const loadMore = action.payload.loadMore;
            const searchParams = action.payload.searchParams;

            const boardState = getState().board;
            const { fen, pageNum, referenceGames } = boardState;
            let url = getReferencesUrl(fen, searchParams, 'get_games');
            url += loadMore ? `&&page=${pageNum + 1}` : '';

            async function searchGames() {
              const response = await fetch(url);
              if (!response.ok) {
                if (
                  loadMore &&
                  referenceGames &&
                  referenceGames.games &&
                  referenceGames.games.length
                ) {
                  action.payload.referenceGames = {
                    games: referenceGames.games,
                    message: 'No more games',
                  };
                } else {
                  action.payload.referenceGames = {
                    message: 'No games found',
                    game: [],
                  };
                }
                return;
              }
              const refGames = await response.json();

              if (loadMore) {
                if (refGames.games.length) {
                  if (refGames.games.length % 10 !== 0) {
                    action.payload.referenceGames = {
                      message: 'No more games',
                      games: [...referenceGames.games, ...refGames.games],
                    };
                  } else {
                    action.payload.referenceGames = {
                      games: [...referenceGames.games, ...refGames.games],
                    };
                  }
                } else {
                  action.payload.referenceGames = {
                    games: [...referenceGames.games],
                    message: 'No more games',
                  };
                }
              } else {
                if (refGames.games.length % 10 !== 0) {
                  action.payload.referenceGames = {
                    message: '-',
                    games: [...refGames.games],
                  };
                } else {
                  action.payload.referenceGames = refGames;
                }
              }
            }
            await searchGames();
            action.payload.searchParams = searchParams;
            action.payload.pageNum = loadMore ? pageNum + 1 : 0;
            break;
          } catch (e) {
            console.error(e.message);
            return dispatch({
              type: 'SETTING_GAME_REFERENCE_FAILED',
              payload: {
                message: 'Failed setting game reference',
              },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_MOVE_LOADER: {
          try {
            const moveLoader = action.payload.moveLoader;
            action.payload.moveLoader = moveLoader;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SETTING_MOVE_LOADER_FAILED',
              payload: {
                message: 'Failed to set move loader',
              },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_VARIATION_OPT: {
          try {
            const variationOpt = action.payload.variationOpt;
            action.payload.moveLoader = variationOpt;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SETTING_VAR_OPT_FAILED',
              payload: { message: 'Failed to set variation option' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_ACTIVE_FILE: {
          try {
            const { fileContent, path, file } = action.payload;
            const activeFileInfo = {
              fileContent: fileContent,
              path: path,
              file: file,
            };
            action.payload.activeFileInfo = activeFileInfo;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SETTING_ACTIVE_FILE_FAILED',
              payload: { message: 'Failed to set active file' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_USER_UPLOADS: {
          try {
            const { path, userInfo } = action.payload;
            if (!userInfo.token) return;
            const token = userInfo.token;
            const boardState = getState().board;
            const { fen, uploadFilterByPos } = boardState;

            async function getDirectories(path, token) {
              const url =
                `${CLOUD_URL}/user_account/get-directory?path=${path}` +
                (uploadFilterByPos ? `&fen=${fen}` : '');
              const response = await fetch(url, {
                method: 'GET',
                headers: {
                  Authorization: `Token ${token}`,
                },
              });
              if (!response.ok) {
                return;
              }
              let respJson = await response.json();
              if (Object.keys(respJson.data).length === 0) {
                respJson.data['noExistingFilesErrorMessage'] = 'No uploads yet';
              }
              action.payload.userUploads = respJson.data;
            }

            await getDirectories(path, token);
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SETTING_USER_UPLOADS_FAILED',
              payload: { message: 'Failed to set user uploads' },
            });
          }
        }

        case BOARD_ACTION_TYPES.UPLOAD_FILES: {
          try {
            const { path, files, userInfo } = action.payload;
            const token = userInfo.token;
            async function uploadFiles(path, files, token) {
              const url = `${CLOUD_URL}/user_account/upload-pgn/`;
              let data = new FormData();
              data.append('path', path);
              for (let i = 0; i < files.length; i++) {
                if (files[i].name.endsWith('.pgn'))
                  data.append('files', files[i]);
              }
              if (!data.has('files')) return;

              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  Authorization: `Token ${token}`,
                },
                body: data,
              });
              if (response.status === 402) {
                const boardState = getState().board;
                const { userUploads } = boardState;
                action.payload.userUploads = userUploads;
                action.payload.uploadLimitExceeded = true;
                return;
              } else if (response.status === 413) {
                const boardState = getState().board;
                const { userUploads } = boardState;
                action.payload.userUploads = userUploads;
                action.payload.uploadSizeExceeded = true;
                return;
              } else if (!response.ok) {
                throw new Error('Something went wrong');
              }
              action.payload.userUploads = {};
              return await response.json();
            }

            const response = await uploadFiles(path, files, token);
            action.payload.uploadFilesResponse = response;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'UPLOADING_FILE_FAILED',
              payload: { message: 'Failed to upload' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_CURRENT_DIRECTORY: {
          try {
            const { directory } = action.payload;
            action.payload.currentDirectory = directory;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_CURRENT_DIRECTORY_FAILED',
              payload: { message: 'Failed to set current directory' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_LOADER: {
          try {
            const { loaderType } = action.payload;
            action.payload.loader = loaderType;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_CURRENT_DIRECTORY_FAILED',
              payload: { message: 'Failed to set current directory' },
            });
          }
        }

        case BOARD_ACTION_TYPES.CREATE_FOLDER: {
          try {
            const { path, name, userInfo } = action.payload;
            const token = userInfo.token;
            async function createFolder(path, name, token) {
              const url = `${CLOUD_URL}/user_account/create-folder/`;
              const data = {};
              data['path'] = path;
              data['name'] = name;
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Something went wrong');
              }

              return await response.json();
            }
            await createFolder(path, name, token);
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'CREATE_FOLDER_FAILED',
              payload: { message: 'Failed to create folder' },
            });
          }
        }

        case BOARD_ACTION_TYPES.EDIT_FOLDER_NAME: {
          try {
            const { oldName, newName, userInfo } = action.payload;
            const token = userInfo.token;
            async function editFolderName(oldName, newName) {
              const url = `${CLOUD_URL}/user_account/update-folder/`;
              const data = {};
              data['old_name'] = oldName;
              data['new_name'] = newName;
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Something went wrong');
              }

              return await response.json();
            }
            await editFolderName(oldName, newName);
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'EDIT_FOLDER_NAME_FAILED',
              payload: { message: 'Failed to edit folder name' },
            });
          }
        }

        case BOARD_ACTION_TYPES.EDIT_FILE_NAME: {
          try {
            const { id, newName, userInfo } = action.payload;
            const token = userInfo.token;
            async function editFileName(id, newName) {
              const url = `${CLOUD_URL}/user_account/update-file/`;
              const data = {};
              data['id'] = id;
              data['new_name'] = newName + '.pgn';
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Something went wrong');
              }

              return await response.json();
            }
            await editFileName(id, newName);
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'EDIT_FILE_NAME_FAILED',
              payload: { message: 'Failed to edit file name' },
            });
          }
        }

        case BOARD_ACTION_TYPES.DELETE_FILES: {
          try {
            const { files, folders, userInfo } = action.payload;
            const token = userInfo.token;
            async function deleteFiles(files, folders, token) {
              const url = `${CLOUD_URL}/user_account/delete-directories/`;
              let data = {};
              if (folders.length) {
                for (let i = 0; i < folders.length; i++) {
                  folders[i] = '/' + folders[i] + '/';
                }
              }
              data['folders'] = folders;
              data['files'] = files;
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify(data),
              });
              if (!response.ok) {
                throw new Error('Something went wrong');
              }
              return await response;
            }
            await deleteFiles(files, folders, token);
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'DELETING_FILES_FAILED',
              payload: { message: 'Failed to delete files' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_UPLOAD_LIMIT_EXCEED: {
          try {
            const { uploadLimitExceeded } = action.payload;
            console.log('SETTING UPLOAD LIMIT EXCEED: ', uploadLimitExceeded);
            action.payload.uploadLimitExceeded = uploadLimitExceeded;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_UPLOAD_LIMIT_EXCEED',
              payload: { message: 'Failed to set upload limit exceed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_UPLOAD_SIZE_EXCEED: {
          try {
            const { uploadSizeExceeded } = action.payload;
            console.log('SETTING UPLOAD LIMIT SIZE: ', uploadSizeExceeded);
            action.payload.uploadLimitExceeded = uploadSizeExceeded;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_UPLOAD_SIZE_EXCEED',
              payload: { message: 'Failed to set upload size exceed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_UPLOAD_SIZE_EXCEED: {
          try {
            const { uploadSizeExceeded } = action.payload;
            console.log('SETTING UPLOAD LIMIT SIZE: ', uploadSizeExceeded);
            action.payload.uploadLimitExceeded = uploadSizeExceeded;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_UPLOAD_SIZE_EXCEED',
              payload: { message: 'Failed to set upload size exceed' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_UPLOAD_FILTER_BY_POS: {
          try {
            const { uploadFilterByPos } = action.payload;
            console.log('SETTING UPLOAD FILTER: ', uploadFilterByPos);
            action.payload.uploadFilterByPos = uploadFilterByPos === 'position';
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SET_UPLOAD_FILTER_BY_POS',
              payload: { message: 'Failed to set upload filter' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_TOUR_NEXT_STEP: {
          try {
            const boardState = getState().board;
            let { tourStepNumber, tourType } = boardState;
            tourStepNumber = tourStepNumber === -1 ? 0 : tourStepNumber;
            const isValidAnalyzeStep =
              tourType === 'analyze' && tourStepNumber < 7;
            const isValidStudyStep = tourType === 'study' && tourStepNumber < 2;
            const isValidPrepareStep =
              tourType === 'prepare' && tourStepNumber < 6;
            action.payload.tourStepNumber =
              tourStepNumber +
              (isValidAnalyzeStep || isValidStudyStep || isValidPrepareStep
                ? 1
                : 0);
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_TOUR_NEXT_STEP',
              payload: { message: 'Failed to set tour next step' },
            });
          }
        }

        case BOARD_ACTION_TYPES.ADD_PGN_TO_ARR: {
          try {
            let { newTabPgnStr, tabFile } = action.payload;
            const boardState = getState().board;
            let {
              allPgnArr,
              activeMove,
              pgnStr,
              pgn,
              analyzingFenTabIndx,
              activePgnTab,
              fen,
              switchedTabAnalyzeFen,
              uploadFilterByPos,
            } = boardState;

            allPgnArr[activePgnTab].tabPgn = pgn;
            allPgnArr[activePgnTab].tabPgnStr = pgnStr;
            allPgnArr[activePgnTab].tabActiveMove = activeMove;

            let tabName = 'Notation';
            let newActiveMove = {};
            let parsedPGN = [];
            let newFen = '';

            if (tabFile && tabFile.key && tabFile.previewInfo) {
              tabName = tabFile.key.split('/')[2];
              newActiveMove = tabFile.previewInfo.activeMove;
              parsedPGN.push(tabFile.previewInfo.pgn);
              newFen = tabFile.previewInfo.fen;
            } else {
              newTabPgnStr = newTabPgnStr.trimEnd();

              newTabPgnStr = addScoreToPgnStr(newTabPgnStr);
              newTabPgnStr = fixPgnStrCommentPosition(newTabPgnStr);

              parsedPGN = pgnParser.parse(newTabPgnStr);
              console.log('PARSED PGN: ', parsedPGN);
              // ADDING layer AND prevMove in each move
              modifyMoves(parsedPGN[0].moves);

              const isSet = chess.load_pgn(newTabPgnStr, { sloppy: true });
              if (!isSet && parsedPGN[0].headers) {
                parsedPGN[0].headers.forEach((head) => {
                  if (head.name === 'FEN') {
                    chess.load(head.value);
                  }
                });
              } else if (!isSet) {
                throw new Error("PGN parsed, but can't load into chess.js");
              }

              const lastMainMove = [...parsedPGN[0].moves]
                .reverse()
                .find((m) => m.layer === 0);

              newTabPgnStr = addScorePGN(newTabPgnStr, chess);

              newActiveMove = lastMainMove ? lastMainMove : {};
              newFen = chess.fen();

              if (tabFile && tabFile.key) {
                tabName = tabFile.key.split('/')[2];
                if (uploadFilterByPos) {
                  const allMatchedFens = findFenMatches(fen, parsedPGN[0]);
                  if (allMatchedFens[0].move) {
                    newActiveMove = allMatchedFens[0].move;
                    newFen = allMatchedFens[0].fen;
                  }
                }
              }
            }

            allPgnArr.push({
              tabPgn: parsedPGN[0],
              tabPgnStr: newTabPgnStr,
              tabActiveMove: newActiveMove,
              tabName: tabName,
              tabFile: tabFile,
            });

            action.payload.pgnStr = newTabPgnStr;
            action.payload.pgn = parsedPGN[0];
            action.payload.fen = newFen;
            action.payload.activeMove = newActiveMove;
            action.payload.allPgnArr = allPgnArr;
            action.payload.activePgnTab = allPgnArr.length - 1;
            action.payload.switchedTabAnalyzeFen =
              analyzingFenTabIndx === activePgnTab
                ? fen
                : switchedTabAnalyzeFen;
            break;
          } catch (e) {
            return dispatch({
              type: 'ADD_PGN_TO_ARR',
              payload: { message: 'Failed to add pgn to the pgn array' },
            });
          }
        }

        case BOARD_ACTION_TYPES.REMOVE_PGN_FROM_ARR: {
          try {
            const { removeTabIndx } = action.payload;
            const boardState = getState().board;
            let {
              allPgnArr,
              activePgnTab,
              pgn,
              pgnStr,
              analyzingFenTabIndx,
              navigationGamesTabs,
            } = boardState;
            const isAnalysingTab = removeTabIndx === analyzingFenTabIndx;

            allPgnArr.splice(removeTabIndx, 1);

            if (activePgnTab === removeTabIndx && allPgnArr.length) {
              const newActiveTab = allPgnArr[removeTabIndx - 1]
                ? removeTabIndx - 1
                : removeTabIndx;
              if (isAnalysingTab) {
                action.payload.analyzingFenTabIndx = newActiveTab;
              } else if (analyzingFenTabIndx > removeTabIndx) {
                action.payload.analyzingFenTabIndx = analyzingFenTabIndx - 1;
              } else {
                action.payload.analyzingFenTabIndx = analyzingFenTabIndx;
              }

              if (
                allPgnArr[newActiveTab].tabPgn.moves &&
                !allPgnArr[newActiveTab].tabPgn.moves.length &&
                allPgnArr[newActiveTab].tabPgn.headers &&
                allPgnArr[newActiveTab].tabPgn.headers.length
              ) {
                allPgnArr[newActiveTab].tabPgn.headers.forEach((head) => {
                  if (head.name === 'FEN') {
                    chess.load(head.value);
                  }
                });
              } else {
                chess.load_pgn(allPgnArr[newActiveTab].tabPgnStr);
              }

              action.payload.pgn = allPgnArr[newActiveTab].tabPgn;
              action.payload.pgnStr = allPgnArr[newActiveTab].tabPgnStr;
              action.payload.activePgnTab = newActiveTab;
            } else {
              if (activePgnTab > removeTabIndx) {
                activePgnTab -= 1;
              }
              if (isAnalysingTab) {
                action.payload.analyzingFenTabIndx = activePgnTab;
              } else if (analyzingFenTabIndx > removeTabIndx) {
                action.payload.analyzingFenTabIndx = analyzingFenTabIndx - 1;
              } else {
                action.payload.analyzingFenTabIndx = analyzingFenTabIndx;
              }

              if (
                pgn.moves &&
                !pgn.moves.length &&
                pgn.headers &&
                pgn.headers.length
              ) {
                pgn.headers.forEach((head) => {
                  if (head.name === 'FEN') {
                    chess.load(head.value);
                  }
                });
              } else {
                chess.load_pgn(pgnStr);
              }

              action.payload.pgn = pgn;
              action.payload.pgnStr = pgnStr;
              action.payload.activePgnTab = activePgnTab;
            }

            if (navigationGamesTabs.includes(removeTabIndx)) {
              navigationGamesTabs.splice(removeTabIndx, 1);
              navigationGamesTabs.forEach((tab, indx) => {
                if (tab > removeTabIndx) {
                  navigationGamesTabs[indx] = tab - 1;
                }
              });

              let nextGamesStorage = JSON.parse(
                sessionStorage.getItem('chessify_next_games')
              );
              nextGamesStorage = nextGamesStorage ? nextGamesStorage : [];
              let exictingIndex = nextGamesStorage.findIndex(
                (elem) => elem.activeTab === removeTabIndx
              );
              if (exictingIndex > -1) {
                nextGamesStorage.splice(exictingIndex, 1);
                nextGamesStorage.forEach((game) => {
                  if (game.activeTab > removeTabIndx) {
                    game.activeTab = game.activeTab - 1;
                  }
                });

                if (nextGamesStorage.length) {
                  sessionStorage.setItem(
                    'chessify_next_games',
                    JSON.stringify(nextGamesStorage)
                  );
                } else {
                  sessionStorage.removeItem('chessify_next_games');
                }
              }
            }
            action.payload.navigationGamesTabs = navigationGamesTabs;
            action.payload.allPgnArr = allPgnArr;
            break;
          } catch (e) {
            return dispatch({
              type: 'REMOVE_PGN_FROM_ARR',
              payload: { message: 'Failed to remove pgn tab' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_ACTIVE_PGN_TAB: {
          try {
            const { newActivePgnTabIndx } = action.payload;
            const boardState = getState().board;
            let {
              allPgnArr,
              activePgnTab,
              activeMove,
              pgnStr,
              pgn,
              analyzingFenTabIndx,
              fen,
              switchedTabAnalyzeFen,
            } = boardState;

            if (
              newActivePgnTabIndx === 0 &&
              allPgnArr.length === 1 &&
              !allPgnArr[0].tabPgnStr.length
            ) {
              allPgnArr[0].tabPgnStr = pgnStr;
              allPgnArr[0].tabPgn = pgn;
              allPgnArr[0].tabActiveMove = activeMove;
            }

            const newPgnStr = allPgnArr[newActivePgnTabIndx].tabPgnStr;
            const newPgn = allPgnArr[newActivePgnTabIndx].tabPgn;
            const isSet = chess.load_pgn(newPgnStr, { sloppy: true });
            if (!isSet && newPgn && newPgn.headers) {
              newPgn.headers.forEach((head) => {
                if (head.name === 'FEN') {
                  chess.load(head.value);
                }
              });
            } else if (!isSet) {
              throw new Error("PGN parsed, but can't load into chess.js");
            }

            allPgnArr[activePgnTab].tabActiveMove = activeMove;
            allPgnArr[activePgnTab].tabPgnStr = pgnStr;
            allPgnArr[activePgnTab].tabPgn = pgn;
            action.payload.allPgnArr = allPgnArr;
            action.payload.activePgnTab = newActivePgnTabIndx;

            action.payload.pgnStr = newPgnStr;
            action.payload.pgn = newPgn;
            action.payload.switchedTabAnalyzeFen =
              analyzingFenTabIndx === activePgnTab
                ? fen
                : switchedTabAnalyzeFen;
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_ACTIVE_PGN_TAB',
              payload: { message: 'Failed to set active pgn tab' },
            });
          }
        }

        case BOARD_ACTION_TYPES.CHANGE_TAB_NAME: {
          try {
            const { newTabName, tabIndex } = action.payload;
            const boardState = getState().board;
            let { allPgnArr } = boardState;
            allPgnArr[tabIndex].tabName = newTabName;

            action.payload.allPgnArr = allPgnArr;
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_ACTIVE_PGN_TAB',
              payload: { message: 'Failed to set active pgn tab' },
            });
          }
        }

        case BOARD_ACTION_TYPES.RESTORE_ALL_PGN_ARR: {
          try {
            const {
              allPgnArr,
              activePgnTab,
              analysisNotationTab,
            } = action.payload;

            allPgnArr.forEach((tabElem) => {
              const pgnStr = tabElem.tabPgnStr;
              const parsedPGN = pgnParser.parse(pgnStr);
              console.log('PARSED PGN: ', parsedPGN);
              // ADDING layer AND prevMove in each move
              modifyMoves(parsedPGN[0].moves);
              const isSet = chess.load_pgn(pgnStr, { sloppy: true });

              if (!isSet && parsedPGN[0].headers) {
                parsedPGN[0].headers.forEach((head) => {
                  if (head.name === 'FEN') {
                    chess.load(head.value);
                  }
                });
              } else if (!isSet) {
                throw new Error("PGN parsed, but can't load into chess.js");
              }

              const lastMainMove = [...parsedPGN[0].moves]
                .reverse()
                .find((m) => m.layer === 0);

              tabElem.tabPgn = parsedPGN[0];
              tabElem.tabActiveMove = lastMainMove ? lastMainMove : {};
            });

            if (analysisNotationTab !== 'null') {
              let analysisTabIndx = +analysisNotationTab;

              if (
                !allPgnArr[analysisTabIndx].tabPgn.moves.length &&
                allPgnArr[analysisTabIndx].tabPgn.headers &&
                allPgnArr[analysisTabIndx].tabPgn.headers.length
              ) {
                allPgnArr[analysisTabIndx].tabPgn.headers.forEach((head) => {
                  if (head.name === 'FEN') {
                    chess.load(head.value);
                  }
                });
              } else {
                chess.load_pgn(allPgnArr[analysisTabIndx].tabPgnStr);
              }
              action.payload.switchedTabAnalyzeFen =
                analysisTabIndx !== +activePgnTab ? chess.fen() : '';
              action.payload.analyzingFenTabIndx = analysisTabIndx;
            } else {
              action.payload.switchedTabAnalyzeFen = '';
              action.payload.analyzingFenTabIndx = null;
            }

            if (
              !allPgnArr[activePgnTab].tabPgn.moves.length &&
              allPgnArr[activePgnTab].tabPgn.headers &&
              allPgnArr[activePgnTab].tabPgn.headers.length
            ) {
              allPgnArr[activePgnTab].tabPgn.headers.forEach((head) => {
                if (head.name === 'FEN') {
                  chess.load(head.value);
                }
              });
            } else {
              chess.load_pgn(allPgnArr[activePgnTab].tabPgnStr);
            }

            action.payload.activePgnTab = +activePgnTab;
            action.payload.pgn = allPgnArr[activePgnTab].tabPgn;
            action.payload.fen = chess.fen();
            action.payload.pgnStr = allPgnArr[activePgnTab].tabPgnStr;
            action.payload.activeMove = allPgnArr[activePgnTab].tabActiveMove;
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_ACTIVE_PGN_TAB',
              payload: { message: 'Failed to set active pgn tab' },
            });
          }
        }

        case BOARD_ACTION_TYPES.APPLY_FULL_ANALYSIS_ON_PGN: {
          try {
            const boardState = getState().board;
            const cloudState = getState().cloud;
            let { pgn } = boardState;
            let { computedMoveScores } = cloudState;

            let newPgn = applyFullAnalysisResult(pgn, computedMoveScores);

            const curHeader = newPgn.headers ? newPgn.headers : [];
            const curMoves = newPgn.moves ? newPgn.moves : [];
            const curComments = getPgnMainComments(pgn.comments);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + curComments + getPgnString(curMoves);

            action.payload.pgn = newPgn;
            action.payload.pgnStr = pgnStr;

            break;
          } catch (e) {
            return dispatch({
              type: 'APPLY_FULL_ANALYSIS_ON_PGN',
              payload: { message: 'Failed to apply full analysis on pgn' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_LICHESS_DB: {
          try {
            const { searchParams, setIsLoading } = action.payload;
            const boardState = getState().board;
            let { fen } = boardState;
            if (searchParams.player && searchParams.player.length) {
              action.payload.lichessDB = await getLichessDBPlayer(
                fen,
                searchParams,
                setIsLoading
              );
              action.payload.searchParamsLichessPlayer = searchParams;
              action.payload.searchParamsLichess = LICHESS_DB_PARAMS;
            } else {
              action.payload.lichessDB = await getLichessDB(fen, searchParams);
              action.payload.searchParamsLichess = searchParams;
              action.payload.searchParamsLichessPlayer = LICHESS_DB_PLAYER_PARAMS;
            }
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_LICHESS_DB',
              payload: { message: 'Failed to set lichess db' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_CHESS_AI_RESPONSE: {
          try {
            const boardState = getState().board;
            const cloudState = getState().cloud;
            let { fen, pgnStr, activeMove, pgn } = boardState;
            let mainPgnStr = pgnStr;
            if (!activeMove || (pgn && !pgn.moves)) {
              mainPgnStr = '';
            } else if (activeMove && Object.keys(activeMove).length !== 0) {
              let pgnClone = cloneDeep(pgn);

              if (activeMove.layer !== 0) {
                let rootVariations = findRootVariations(activeMove).reverse();
                rootVariations.push(activeMove.move_id);
                let indexedPath = findIndexedPath([pgnClone], rootVariations);
                while (indexedPath.length >= 2) {
                  findLast2MovesOfIndexedPath(pgnClone, indexedPath);
                  indexedPath.pop();
                }
              }

              pgnClone.moves.forEach((mv) => {
                if (mv.ravs) {
                  delete mv.ravs;
                }
              });

              const curHeader = pgnClone.headers ? pgnClone.headers : [];
              const curMoves = pgnClone.moves ? pgnClone.moves : [];
              const curComments = getPgnMainComments(pgnClone.comments);

              const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
              mainPgnStr = pgnHeader + curComments + getPgnString(curMoves);
            }

            let resp = await getChessAIResponse(
              fen,
              mainPgnStr,
              cloudState.userInfo.token
            );
            action.payload.chessAIResponse = resp;
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_CHESS_AI_RESPONSE',
              payload: { message: 'Failed to set chess ai response' },
            });
          }
        }

        case BOARD_ACTION_TYPES.SET_NAV_GAMES_INFO: {
          try {
            const { indent, reset } = action.payload;
            const boardState = getState().board;
            let {
              navigationGames,
              searchParams,
              navigationGameIndx,
              navigationPages,
              navigationGamesTabs,
              activePgnTab,
            } = boardState;
            let newIndx = navigationGameIndx + indent - navigationPages[0] * 10;
            let newNavigationGames = [];

            async function searchGames(pageNum) {
              let navGamesParams = {
                whitePlayer: searchParams.whitePlayer,
                blackPlayer: searchParams.blackPlayer,
                ignoreColor: searchParams.ignoreColor,
              };
              let url = getReferencesUrl(
                INITIAL_FEN,
                navGamesParams,
                'get_games'
              );
              url += `&&page=${pageNum}`;

              const response = await fetch(url);
              if (!response.ok) {
                return { games: [] };
              }
              const refGames = await response.json();

              return refGames;
            }

            if (reset || (navigationGames && !navigationGames.games)) {
              const refGames0 = await searchGames(0);
              const refGames1 = await searchGames(1);
              newNavigationGames = {
                games: [...refGames0.games, ...refGames1.games],
              };
              action.payload.navigationGames = newNavigationGames;
              action.payload.navigationGameIndx = -1;
              action.payload.navigationPages = [0, 1];
            }

            if (navigationGames && navigationGames.games && newIndx > -1) {
              if (
                newIndx < navigationGames.games.length - 1 &&
                (newIndx > 0 || (newIndx === 0 && navigationPages[0] === 0))
              ) {
                newNavigationGames = navigationGames;
                action.payload.navigationGames = navigationGames;
                action.payload.navigationGameIndx = navigationGameIndx + indent;
                action.payload.navigationPages = navigationPages;
              } else if (newIndx === navigationGames.games.length - 1) {
                const newPageIndx =
                  navigationPages[navigationPages.length - 1] + 1;

                navigationGames.games.splice(0, 10);
                newIndx -= 10;
                const refGames = await searchGames(newPageIndx);
                newNavigationGames = {
                  games: [...navigationGames.games, ...refGames.games],
                };
                action.payload.navigationGames = newNavigationGames;

                navigationPages.shift();
                navigationPages.push(newPageIndx);
                action.payload.navigationPages = navigationPages;
                action.payload.navigationGameIndx = navigationGameIndx + indent;
              } else if (newIndx === 0 && navigationPages[0] !== 0) {
                const newPageIndx = navigationPages[0] - 1;

                navigationGames.games.splice(10, 10);
                newIndx += 10;
                const refGames = await searchGames(newPageIndx);
                newNavigationGames = {
                  games: [...refGames.games, ...navigationGames.games],
                };
                action.payload.navigationGames = newNavigationGames;

                navigationPages.pop();
                navigationPages.unshift(newPageIndx);
                action.payload.navigationPages = navigationPages;
                action.payload.navigationGameIndx = navigationGameIndx + indent;
              }
            }

            if (
              newIndx >= 0 &&
              newNavigationGames &&
              newNavigationGames.games &&
              newNavigationGames.games.length
            ) {
              let nextGamesStorage = JSON.parse(
                sessionStorage.getItem('chessify_next_games')
              );
              nextGamesStorage = nextGamesStorage ? nextGamesStorage : [];
              let exictingIndex = nextGamesStorage.findIndex(
                (elem) => elem.activeTab === activePgnTab
              );
              if (exictingIndex > -1) {
                nextGamesStorage[exictingIndex] = {
                  activeTab: activePgnTab,
                  game: newNavigationGames.games[newIndx],
                };
              } else {
                nextGamesStorage.push({
                  activeTab: activePgnTab,
                  game: newNavigationGames.games[newIndx],
                });
              }
              sessionStorage.setItem(
                'chessify_next_games',
                JSON.stringify(nextGamesStorage)
              );
              if (!navigationGamesTabs.includes(activePgnTab)) {
                navigationGamesTabs.push(activePgnTab);
              }
            }

            action.payload.navigationGamesTabs = navigationGamesTabs;
            break;
          } catch (e) {
            return dispatch({
              type: 'SET_NAV_GAMES_INFO',
              payload: { message: 'Failed to set navigation info' },
            });
          }
        }

        ////
        // DEFAULT
        ////
        default: {
          break;
        }
      }
      return next(action);
    };
  };
}

export default [boardMiddleware];
