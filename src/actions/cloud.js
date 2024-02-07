import CLOUD_ACTION_TYPES from '../constants/cloud-action-types';

export function setToken(token) {
  return { type: CLOUD_ACTION_TYPES.SET_TOKEN, payload: { token } };
}

export function setVideosFen(videosFen) {
  return { type: CLOUD_ACTION_TYPES.SET_VIDEOS_FEN, payload: { videosFen } };
}

export function setGames(games) {
  return { type: CLOUD_ACTION_TYPES.SET_GAMES, payload: { games } };
}

export function connectToFree() {
  return { type: CLOUD_ACTION_TYPES.CONNECT_TO_FREE };
}

export function setFreeAnalyzer(freeAnalyzer) {
  return {
    type: CLOUD_ACTION_TYPES.SET_FREE_ANALYZER,
    payload: { freeAnalyzer },
  };
}

export function connectToPro(proWSSChannels, fullAnalysisOn = false) {
  return {
    type: CLOUD_ACTION_TYPES.CONNECT_TO_PRO,
    payload: { proWSSChannels, fullAnalysisOn },
  };
}

export function updateNumPV(numPV) {
  return {
    type: CLOUD_ACTION_TYPES.UPDATE_NUM_PV,
    payload: { numPV },
  };
}

export function getUserAccount(userInfo) {
  return {
    type: CLOUD_ACTION_TYPES.GET_USER_INFO,
    payload: { userInfo },
  };
}
export function getUserServersInfo(serverInfo) {
  return {
    type: CLOUD_ACTION_TYPES.GET_USER_SERVERS_INFO,
    payload: { serverInfo },
  };
}
export function getUserNotifictionInfo(notification) {
  return {
    type: CLOUD_ACTION_TYPES.GET_USER_NOTIFICATION_INFO,
    payload: { notification },
  };
}
export function getUserPlansInfo(plans) {
  return {
    type: CLOUD_ACTION_TYPES.GET_USER_PLANS_INFO,
    payload: { plans },
  };
}

export function setSavedAnalyzeInfo(analyzeInfo) {
  return {
    type: CLOUD_ACTION_TYPES.SET_SAVED_ANALYZE_INFO,
    payload: { analyzeInfo },
  };
}

export function setSubModal(mType) {
  return {
    type: CLOUD_ACTION_TYPES.SET_SUB_MODAL,
    payload: { mType },
  };
}

export function setPauseAnalysisUpdate(pauseAnalysisUpdate) {
  return {
    type: CLOUD_ACTION_TYPES.SET_PAUSE_ANALYSIS_UPDATE,
    payload: { pauseAnalysisUpdate },
  };
}

export function setComputedData(computedMoveScores) {
  return {
    type: CLOUD_ACTION_TYPES.SET_COMPUTED_DATA,
    payload: { computedMoveScores },
  };
}

export function setFullAnalysisOn(fullAnalysisOn) {
  return {
    type: CLOUD_ACTION_TYPES.SET_FULL_ANALYSIS_ON,
    payload: { fullAnalysisOn },
  };
}

export function setFullGameFenArr(fenArr) {
  return {
    type: CLOUD_ACTION_TYPES.SET_FULL_GAME_FEN_ARR,
    payload: { fenArr },
  };
}

export function setFullAnalysisDepth(fullAnalysisDepth) {
  return {
    type: CLOUD_ACTION_TYPES.SET_FULL_ANALYSIS_DEPTH,
    payload: { fullAnalysisDepth },
  };
}

export function setInitiateFullAnalysis(initiateFullAnalysis) {
  return {
    type: CLOUD_ACTION_TYPES.SET_INITIATE_FULL_ANALYSIS,
    payload: { initiateFullAnalysis },
  };
}

export function switchAnalysisColor(isColorSwitched) {
  return {
    type: CLOUD_ACTION_TYPES.SWITCH_ANALYSIS_COLOR,
    payload: { isColorSwitched },
  };
}

export function setIsGuestUser(isGuestUser) {
  return {
    type: CLOUD_ACTION_TYPES.SET_IS_GUEST_USER,
    payload: { isGuestUser },
  };
}

export default {
  setToken,
  setVideosFen,
  setGames,
  connectToFree,
  setFreeAnalyzer,
  connectToPro,
  updateNumPV,
  setSubModal,
  setPauseAnalysisUpdate,
  setComputedData,
  setFullGameFenArr,
  setFullAnalysisDepth,
  setInitiateFullAnalysis,
  switchAnalysisColor,
  getUserServersInfo,
  getUserAccount,
  getUserNotifictionInfo,
  getUserPlansInfo,
};
