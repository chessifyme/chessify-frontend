import BOARD_ACTION_TYPES from '../constants/board-action-types';
import BOARD_PARAMS from '../constants/board-params';

const initialState = {
  fen: BOARD_PARAMS.INITIAL_FEN_URL,
  pgnStr: ' *',
  pgn: {},
  activeMove: {},
  orientation: BOARD_PARAMS.BOARD_ORIENTATION,
  referenceData: {},
  searchParams: {},
  referenceGames: {},
  moveLoader: false,
  variationOpt: false,
  pageNum: 0,
  activeFileInfo: {},
  userUploads: {},
  currentDirectory: '/',
  loader: '',
  uploadLimitExceeded: false,
  uploadSizeExceeded: false,
  isEditMode: false,
  matchedPositionName: null,
  uploadFilesResponse: {},
  uploadFilterByPos: false,
  tourType: '',
  tourStepNumber: 0,
  nextMove: {},
  allPgnArr: [
    {
      tabPgn: {},
      tabPgnStr: '',
      tabActiveMove: {},
      tabName: 'Notation',
      tabFile: {},
    },
  ],
  activePgnTab: 0,
  analyzingFenTabIndx: null,
  switchedTabAnalyzeFen: '',
  lichessDB: {},
  searchParamsLichess: BOARD_PARAMS.LICHESS_DB_PARAMS,
  searchParamsLichessPlayer: BOARD_PARAMS.LICHESS_DB_PLAYER_PARAMS,
  chessAIResponse: {},
  navigationGames: {},
  navigationGameIndx: -1,
  navigationPages: [0, 1],
  navigationGamesTabs: [],
};

function boardReducer(state = initialState, action) {
  switch (action.type) {
    case BOARD_ACTION_TYPES.SET_FEN: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        fen: action.payload.fen,
        pgn: action.payload.pgn,
      };
    }
    case BOARD_ACTION_TYPES.SET_INITIAL_PGN: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        activeMove: {},
        nextMove: {},
      };
    }
    case BOARD_ACTION_TYPES.SET_PGN: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        nextMove: undefined,
      };
    }
    case BOARD_ACTION_TYPES.DO_MOVE: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        variationOpt: action.payload.variationOpt,
        moveLoader: true,
        nextMove: action.payload.nextMove,
      };
    }
    case BOARD_ACTION_TYPES.SET_ACTIVE_MOVE: {
      return {
        ...state,
        activeMove: action.payload.activeMove,
        fen: action.payload.fen,
        nextMove: action.payload.nextMove,
      };
    }
    case BOARD_ACTION_TYPES.SET_BOARD_ORIENTATION: {
      return {
        ...state,
        orientation: action.payload.orientation,
      };
    }
    case BOARD_ACTION_TYPES.PROMOTE_VARIATION: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
      };
    }
    case BOARD_ACTION_TYPES.DELETE_REMAINING_MOVES: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        nextMove: undefined,
      };
    }
    case BOARD_ACTION_TYPES.DELETE_VARIATION: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        nextMove: action.payload.nextMove,
      };
    }
    case BOARD_ACTION_TYPES.DELETE_VARIATIONS_AND_COMMENTS: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        nextMove: undefined,
      };
    }
    case BOARD_ACTION_TYPES.ADD_NAGS: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        activeMove: { ...action.payload.activeMove },
      };
    }
    case BOARD_ACTION_TYPES.DELETE_MOVE_COMMENT: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
      };
    }
    case BOARD_ACTION_TYPES.DELETE_MOVE_NAG: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
      };
    }
    case BOARD_ACTION_TYPES.ADD_COMMENT_TO_MOVE: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
      };
    }
    case BOARD_ACTION_TYPES.ADD_COMMAND_TO_MOVE: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
        activeMove: action.payload.activeMove,
      };
    }
    case BOARD_ACTION_TYPES.ADD_COMMAND_TO_HEADER: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: { ...action.payload.pgn },
      };
    }
    case BOARD_ACTION_TYPES.SET_REFERENCE: {
      return {
        ...state,
        referenceData: { ...action.payload.referenceData },
        moveLoader: action.payload.moveLoader,
      };
    }
    case BOARD_ACTION_TYPES.SET_GAME_REFERENCE: {
      return {
        ...state,
        referenceGames: { ...action.payload.referenceGames },
        loader: '',
        searchParams: { ...action.payload.searchParams },
        pageNum: action.payload.pageNum,
      };
    }
    case BOARD_ACTION_TYPES.SET_MOVE_LOADER: {
      return {
        ...state,
        moveLoader: action.payload.moveLoader,
      };
    }
    case BOARD_ACTION_TYPES.SET_VARIATION_OPT: {
      return {
        ...state,
        variationOpt: action.payload.variationOpt,
      };
    }
    case BOARD_ACTION_TYPES.SET_ACTIVE_FILE: {
      return {
        ...state,
        activeFileInfo: { ...action.payload.activeFileInfo },
      };
    }
    case BOARD_ACTION_TYPES.SET_USER_UPLOADS: {
      return {
        ...state,
        userUploads: { ...action.payload.userUploads },
        loader: '',
      };
    }
    case BOARD_ACTION_TYPES.UPLOAD_FILES: {
      return {
        ...state,
        userUploads: action.payload.userUploads,
        uploadLimitExceeded: action.payload.uploadLimitExceeded,
        uploadSizeExceeded: action.payload.uploadSizeExceeded,
        uploadFilesResponse: action.payload.uploadFilesResponse,
      };
    }
    case BOARD_ACTION_TYPES.SET_CURRENT_DIRECTORY: {
      return {
        ...state,
        currentDirectory: action.payload.currentDirectory,
      };
    }
    case BOARD_ACTION_TYPES.SET_LOADER: {
      return {
        ...state,
        loader: action.payload.loader,
      };
    }
    case BOARD_ACTION_TYPES.CREATE_FOLDER:
    case BOARD_ACTION_TYPES.EDIT_FOLDER_NAME:
    case BOARD_ACTION_TYPES.EDIT_FILE_NAME:
    case BOARD_ACTION_TYPES.DELETE_FILES: {
      return {
        ...state,
        userUploads: {},
      };
    }

    case BOARD_ACTION_TYPES.SET_UPLOAD_LIMIT_EXCEED: {
      return {
        ...state,
        uploadLimitExceeded: action.payload.uploadLimitExceeded,
      };
    }

    case BOARD_ACTION_TYPES.SET_UPLOAD_SIZE_EXCEED: {
      return {
        ...state,
        uploadSizeExceeded: action.payload.uploadSizeExceeded,
      };
    }

    case BOARD_ACTION_TYPES.SET_EDIT_MODE: {
      return {
        ...state,
        isEditMode: action.payload.isEditMode,
      };
    }

    case BOARD_ACTION_TYPES.SET_MATCHED_OPENING_POSITION: {
      return {
        ...state,
        matchedPositionName: action.payload.isPositionMatched,
      };
    }

    case BOARD_ACTION_TYPES.SET_UPLOAD_FILTER_BY_POS: {
      return {
        ...state,
        uploadFilterByPos: action.payload.uploadFilterByPos,
      };
    }
    case BOARD_ACTION_TYPES.SET_TOUR_TYPE: {
      return {
        ...state,
        tourType: action.payload.tourType,
      };
    }
    case BOARD_ACTION_TYPES.SET_TOUR_NUMBER: {
      return {
        ...state,
        tourStepNumber: action.payload.tourStepNumber,
      };
    }
    case BOARD_ACTION_TYPES.SET_TOUR_NEXT_STEP: {
      return {
        ...state,
        tourStepNumber: action.payload.tourStepNumber,
      };
    }

    case BOARD_ACTION_TYPES.ADD_PGN_TO_ARR: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        fen: action.payload.fen,
        activeMove: action.payload.activeMove,
        nextMove: undefined,
        allPgnArr: action.payload.allPgnArr,
        activePgnTab: action.payload.activePgnTab,
        switchedTabAnalyzeFen: action.payload.switchedTabAnalyzeFen,
      };
    }

    case BOARD_ACTION_TYPES.REMOVE_PGN_FROM_ARR: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        allPgnArr: action.payload.allPgnArr,
        activePgnTab: action.payload.activePgnTab,
        analyzingFenTabIndx: action.payload.analyzingFenTabIndx,
        navigationGamesTabs: action.payload.navigationGamesTabs,
      };
    }

    case BOARD_ACTION_TYPES.SET_ACTIVE_PGN_TAB: {
      return {
        ...state,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        activePgnTab: action.payload.activePgnTab,
        allPgnArr: action.payload.allPgnArr,
        switchedTabAnalyzeFen: action.payload.switchedTabAnalyzeFen,
      };
    }

    case BOARD_ACTION_TYPES.CHANGE_TAB_NAME: {
      return {
        ...state,
        allPgnArr: action.payload.allPgnArr,
      };
    }

    case BOARD_ACTION_TYPES.SET_ANALYZING_FEN_TAB_INDX: {
      return {
        ...state,
        analyzingFenTabIndx: action.payload.analyzingFenTabIndx,
      };
    }

    case BOARD_ACTION_TYPES.RESTORE_ALL_PGN_ARR: {
      return {
        ...state,
        allPgnArr: action.payload.allPgnArr,
        activePgnTab: action.payload.activePgnTab,
        pgnStr: action.payload.pgnStr,
        pgn: action.payload.pgn,
        activeMove: action.payload.activeMove,
        switchedTabAnalyzeFen: action.payload.switchedTabAnalyzeFen,
        analyzingFenTabIndx: action.payload.analyzingFenTabIndx,
        fen: action.payload.fen,
      };
    }

    case BOARD_ACTION_TYPES.APPLY_FULL_ANALYSIS_ON_PGN: {
      return {
        ...state,
        pgn: action.payload.pgn,
        activeMove: {},
        pgnStr: action.payload.pgnStr,
      };
    }

    case BOARD_ACTION_TYPES.SET_SWITCHED_TAB_ANALYZING_FEN: {
      return {
        ...state,
        switchedTabAnalyzeFen: action.payload.analyzingFen,
      };
    }

    case BOARD_ACTION_TYPES.SET_LICHESS_DB: {
      return {
        ...state,
        lichessDB: action.payload.lichessDB,
        searchParamsLichess: action.payload.searchParamsLichess,
        searchParamsLichessPlayer: action.payload.searchParamsLichessPlayer,
      };
    }

    case BOARD_ACTION_TYPES.SET_CHESS_AI_RESPONSE: {
      return {
        ...state,
        chessAIResponse: action.payload.chessAIResponse,
      };
    }

    case BOARD_ACTION_TYPES.SET_NAV_GAMES_INFO: {
      return {
        ...state,
        navigationGames: action.payload.navigationGames,
        navigationGameIndx: action.payload.navigationGameIndx,
        navigationPages: action.payload.navigationPages,
        navigationGamesTabs: action.payload.navigationGamesTabs,
      };
    }

    default: {
      // console.warn('Unhandled or System action fired: ', action.type);
      return state;
    }
  }
}

export default boardReducer;
