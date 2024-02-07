import { cloneDeep } from 'lodash';
import CLOUD_ACTION_TYPES from '../constants/cloud-action-types';

const initialState = {
  token: '', // Firebase ID Token
  videosFen: '', // Videos result from Backend
  games: [], // Hot Games result from backend
  freeAnalyzer: null, // Mobile Free Analyzer up to 30,000 kN/s. Object like {id: uuid, name: stockfish10, analyzer: <SOCKET.IO CONNECTION>, analysis: <ANALYSIS_RESULT>, isAnalysing: true}
  proAnalyzers: null, // Pro Analyzers. List containing objects like {id: uuid, name: stockfish10, analyzer: <WS_CONNECTION>, analysis: <ANALYSIS_RESULT>, isAnalysing: true}
  numPV: {
    asmfish: 3,
    stockfish10: 3,
    sugar: 3,
    lc0: 3,
    berserk: 3,
    koivisto: 3,
    rubichess: 3,
    shashchess: 3,
    komodo: 3,
  },
  userInfo: {}, //User acconut information from backend
  serverInfo: {}, //servers information from backend
  notification: {}, //notification information from backend
  plans: {}, //plans information from backend
  savedAnalyzeInfo: null, // The latest analysis info is saved in session storage
  mType: '',
  pauseAnalysisUpdate: false,
  computedMoveScores: [],
  fullAnalysisOn: false,
  fenArr: [],
  fullAnalysisDepth: 20,
  initiateFullAnalysis: false,
  isColorSwitched: false,
  isGuestUser: false,
};

function cloudReducer(state = initialState, action) {
  switch (action.type) {
    case CLOUD_ACTION_TYPES.SET_TOKEN: {
      return { ...state, token: action.payload.token };
    }
    case CLOUD_ACTION_TYPES.SET_VIDEOS_FEN: {
      return { ...state, videosFen: action.payload.videosFen };
    }
    case CLOUD_ACTION_TYPES.SET_GAMES: {
      return { ...state, games: action.payload.games };
    }
    case CLOUD_ACTION_TYPES.SET_FREE_ANALYZER: {
      console.log('SETTING ANALYZER: ', action.payload);
      return {
        ...state,
        freeAnalyzer: {
          ...state.freeAnalyzer,
          analyzer: action.payload.freeAnalyzer,
        },
      };
    }
    case CLOUD_ACTION_TYPES.SET_FREE_ANALYSIS_DATA: {
      console.log('SETTING ANALYSIS: ', action.payload);

      return {
        ...state,
        freeAnalyzer: {
          ...state.freeAnalyzer,
          analysis: action.payload.freeAnalysisData
            ? action.payload.freeAnalysisData
            : state.freeAnalyzer.analysis,
          isAnalysing: action.payload.isAnalysing,
        },
      };
    }
    case CLOUD_ACTION_TYPES.SET_PRO_ANALYZERS: {
      return {
        ...state,
        proAnalyzers: action.payload.proAnalyzers,
        fullAnalysisOn: action.payload.fullAnalysisOn,
        computedMoveScores: action.payload.computedMoveScores,
      };
    }

    case CLOUD_ACTION_TYPES.UPDATE_NUM_PV: {
      const { numPV } = action.payload;
      const newProAnalyzers = cloneDeep(state.proAnalyzers);
      newProAnalyzers.forEach((pa) => {
        while (pa.analysis && pa.analysis.variations.length > numPV[pa.name])
          pa.analysis.variations.pop();
      });
      return {
        ...state,
        proAnalyzers: newProAnalyzers,
        numPV: action.payload.numPV,
      };
    }
    case CLOUD_ACTION_TYPES.GET_USER_INFO: {
      return { ...state, userInfo: action.payload.userInfo };
    }
    case CLOUD_ACTION_TYPES.GET_USER_SERVERS_INFO: {
      return { ...state, serverInfo: action.payload.serverInfo };
    }
    case CLOUD_ACTION_TYPES.GET_USER_NOTIFICATION_INFO: {
      return { ...state, notification: action.payload.notification };
    }
    case CLOUD_ACTION_TYPES.GET_USER_PLANS_INFO: {
      return { ...state, plans: action.payload.plans };
    }

    case CLOUD_ACTION_TYPES.SET_SAVED_ANALYZE_INFO: {
      return { ...state, savedAnalyzeInfo: action.payload.analyzeInfo };
    }
    case CLOUD_ACTION_TYPES.SET_SUB_MODAL: {
      return { ...state, mType: action.payload.mType };
    }
    case CLOUD_ACTION_TYPES.SET_PAUSE_ANALYSIS_UPDATE: {
      return {
        ...state,
        pauseAnalysisUpdate: action.payload.pauseAnalysisUpdate,
      };
    }
    case CLOUD_ACTION_TYPES.SET_COMPUTED_DATA: {
      console.log('COMPUTED DATA: ', action.payload.computedMoveScores);
      return {
        ...state,
        computedMoveScores: action.payload.computedMoveScores,
      };
    }

    case CLOUD_ACTION_TYPES.SET_FULL_ANALYSIS_ON: {
      return { ...state, fullAnalysisOn: action.payload.fullAnalysisOn };
    }

    case CLOUD_ACTION_TYPES.SET_FULL_GAME_FEN_ARR: {
      return { ...state, fenArr: action.payload.fenArr };
    }

    case CLOUD_ACTION_TYPES.SET_FULL_ANALYSIS_DEPTH: {
      return { ...state, fullAnalysisDepth: action.payload.fullAnalysisDepth };
    }

    case CLOUD_ACTION_TYPES.SET_INITIATE_FULL_ANALYSIS: {
      return {
        ...state,
        initiateFullAnalysis: action.payload.initiateFullAnalysis,
      };
    }

    case CLOUD_ACTION_TYPES.SWITCH_ANALYSIS_COLOR: {
      return {
        ...state,
        isColorSwitched: action.payload.isColorSwitched,
      };
    }

    case CLOUD_ACTION_TYPES.SET_IS_GUEST_USER: {
      return {
        ...state,
        isGuestUser: action.payload.isGuestUser,
      };
    }

    default: {
      // console.warn('Unhandled or System action fired: ', action.type);
    }
  }

  return state;
}

export default cloudReducer;
