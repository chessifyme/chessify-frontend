import Chess from 'chess.js';
import pgnParser from 'pgn-parser';
import BOARD_ACTION_TYPES from '../constants/board-action-types';
import BOARD_PARAMS from '../constants/board-params';
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
} from '../utils/pgn-viewer';
import { setActiveMove } from '../actions/board';
import { CLOUD_URL } from '../constants/cloud-params';

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
            let pgn = action.payload.pgn.trimEnd();
            pgn = addScoreToPgnStr(pgn);
            pgn = fixPgnStrCommentPosition(pgn);
            const parsedPGN = pgnParser.parse(pgn);
            console.log('PARSED PGN: ', parsedPGN);
            // ADDING layer AND prevMove in each move
            modifyMoves(parsedPGN[0].moves);
            const isSet = chess.load_pgn(pgn, { sloppy: true });

            if (!isSet)
              throw new Error("PGN parsed, but can't load into chess.js");

            const lastMainMove = [...parsedPGN[0].moves]
              .reverse()
              .find((m) => m.layer === 0);

            pgn = addScorePGN(pgn, chess);

            action.payload.pgnStr = pgn;
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
            if (!mv) throw new Error(`Invalid move: ${action.payload.move}`);

            const boardState = getState().board;
            const { pgn, activeMove, pgnStr } = boardState;

            const moveToAdd = {
              move: mv.san,
              move_number,
              comments: [],
            };

            const curMoves = pgn.moves ? pgn.moves : [];
            const curHeader = pgn.headers ? pgn.headers : [];

            const newActiveMove = addMove(curMoves, activeMove, moveToAdd);

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStrNew = pgnHeader + getPgnString(curMoves);

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
            if (!move.move) {
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
            console.log('PROMOTED UPDATED: ', pgn);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            if (!isSet)
              throw new Error("PGN parsed, but can't load into chess.js");

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            if (!isSet)
              throw new Error("PGN parsed, but can't load into chess.js");

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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

            if (!move.move) {
              console.log('No move');
              return;
            }

            if (!comment.length) {
              console.log('No text to add');
              return;
            }

            const boardState = getState().board;
            let { pgn } = boardState;

            let rootVariations = findRootVariations(move).reverse();
            rootVariations.push(move.move_id);
            const indexedPath = findIndexedPath([pgn], rootVariations);

            addCommentToMV(pgn, indexedPath, comment);

            const curHeader = pgn.headers ? pgn.headers : [];
            const curMoves = pgn.moves ? pgn.moves : [];

            const pgnHeader = curHeader.length ? getPgnHeader(curHeader) : '';
            const pgnStr = pgnHeader + getPgnString(curMoves);

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
                action.payload.gameRefLoader = false;
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
            action.payload.gameRefLoader = false;
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

        case BOARD_ACTION_TYPES.SET_GAME_REF_LOADER: {
          try {
            const gameRefLoader = action.payload.gameRefLoader;
            action.payload.moveLoader = gameRefLoader;
            break;
          } catch (e) {
            console.error(e);
            return dispatch({
              type: 'SETTING_GAME_REF_LOADER_FAILED',
              payload: { message: 'Failed to set game ref loader' },
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
              type: 'SET_CURRENT_DIRECTORY_FAILED',
              payload: { message: 'Failed to set current directory' },
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
              tourType === 'analyze' && tourStepNumber < 6;
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
            } = boardState;

            allPgnArr[activePgnTab].tabPgn = pgn;
            allPgnArr[activePgnTab].tabPgnStr = pgnStr;
            allPgnArr[activePgnTab].tabActiveMove = activeMove;

            newTabPgnStr = newTabPgnStr.trimEnd();

            newTabPgnStr = addScoreToPgnStr(newTabPgnStr);
            newTabPgnStr = fixPgnStrCommentPosition(newTabPgnStr);

            const parsedPGN = pgnParser.parse(newTabPgnStr);
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

            let tabName = 'Notation';

            if (tabFile && tabFile.key) {
              tabName = tabFile.key.split('/')[2];
            }

            allPgnArr.push({
              tabPgn: parsedPGN[0],
              tabPgnStr: newTabPgnStr,
              tabActiveMove: lastMainMove ? lastMainMove : {},
              tabName: tabName,
              tabFile: tabFile,
            });

            action.payload.pgnStr = newTabPgnStr;
            action.payload.pgn = parsedPGN[0];
            action.payload.fen = chess.fen();
            action.payload.activeMove = lastMainMove ? lastMainMove : {};
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

              if (!pgn.moves.length && pgn.headers && pgn.headers.length) {
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
              !allPgnArr[newActivePgnTabIndx].tabPgnStr.length
            ) {
              allPgnArr[newActivePgnTabIndx].tabPgnStr = pgnStr;
              allPgnArr[newActivePgnTabIndx].tabPgn = pgn;
              allPgnArr[newActivePgnTabIndx].tabActiveMove = activeMove;
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

            const cloudState = getState().cloud;
            const { proAnalyzers, numPV } = cloudState;

            if (analysisNotationTab !== 'null' && proAnalyzers) {
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

              proAnalyzers.forEach((pa) => {
                pa.analyzer.send('stop');
                pa.analyzer.send(
                  `setoption name MultiPV value ${numPV[pa.name]}`
                );
                pa.analyzer.send(`position fen ${chess.fen()}`);
                pa.analyzer.send('go infinite');
              });
              action.payload.switchedTabAnalyzeFen = chess.fen();
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
