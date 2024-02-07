import BOARD_ACTION_TYPES from '../constants/board-action-types';

export function setFen(fen) {
  return function (dispatch) {
    // Reseting Pgn
    dispatch({ type: BOARD_ACTION_TYPES.SET_INITIAL_PGN, payload: {} });
    dispatch({ type: BOARD_ACTION_TYPES.SET_FEN, payload: { fen } });
  };
}

export function setInitialPgn() {
  return { type: BOARD_ACTION_TYPES.SET_INITIAL_PGN };
}

export function setPgn(pgn) {
  return { type: BOARD_ACTION_TYPES.SET_PGN, payload: { pgn } };
}

export function doMove(move) {
  return { type: BOARD_ACTION_TYPES.DO_MOVE, payload: { move } };
}

export function setActiveMove(activeMove) {
  return {
    type: BOARD_ACTION_TYPES.SET_ACTIVE_MOVE,
    payload: { activeMove },
  };
}

export function setBoardOrientation(orientation) {
  return {
    type: BOARD_ACTION_TYPES.SET_BOARD_ORIENTATION,
    payload: { orientation },
  };
}

export function promoteVariation(move) {
  return {
    type: BOARD_ACTION_TYPES.PROMOTE_VARIATION,
    payload: { move },
  };
}

export function deleteRemainingMoves(move) {
  return {
    type: BOARD_ACTION_TYPES.DELETE_REMAINING_MOVES,
    payload: { move },
  };
}

export function deleteVariation(move) {
  return {
    type: BOARD_ACTION_TYPES.DELETE_VARIATION,
    payload: { move },
  };
}

export function deleteVarsAndComments() {
  return {
    type: BOARD_ACTION_TYPES.DELETE_VARIATIONS_AND_COMMENTS,
    payload: {},
  };
}

export function addNags(move, nag) {
  return {
    type: BOARD_ACTION_TYPES.ADD_NAGS,
    payload: { move, nag },
  };
}

export function deleteMoveComment(move) {
  return {
    type: BOARD_ACTION_TYPES.DELETE_MOVE_COMMENT,
    payload: { move },
  };
}

export function deleteMoveNag(move) {
  return {
    type: BOARD_ACTION_TYPES.DELETE_MOVE_NAG,
    payload: { move },
  };
}

export function addCommentToMove(move, comment, commentIndx) {
  return {
    type: BOARD_ACTION_TYPES.ADD_COMMENT_TO_MOVE,
    payload: { move, comment, commentIndx },
  };
}

export function addCommandToMove(move, command) {
  return {
    type: BOARD_ACTION_TYPES.ADD_COMMAND_TO_MOVE,
    payload: { move, command },
  };
}

export function addCommandToHeader(command) {
  return {
    type: BOARD_ACTION_TYPES.ADD_COMMAND_TO_HEADER,
    payload: { command },
  };
}

export function setReference(fen, searchParams) {
  return {
    type: BOARD_ACTION_TYPES.SET_REFERENCE,
    payload: { fen, searchParams },
  };
}

export function setGameReference(loadMore, searchParams) {
  return {
    type: BOARD_ACTION_TYPES.SET_GAME_REFERENCE,
    payload: { loadMore, searchParams },
  };
}

export function setMoveLoader(moveLoader) {
  return {
    type: BOARD_ACTION_TYPES.SET_MOVE_LOADER,
    payload: { moveLoader },
  };
}

export function setVariationOpt(variationOpt) {
  return {
    type: BOARD_ACTION_TYPES.SET_VARIATION_OPT,
    payload: { variationOpt },
  };
}

export function setActiveFile(fileContent, file, path) {
  return {
    type: BOARD_ACTION_TYPES.SET_ACTIVE_FILE,
    payload: { fileContent, file, path },
  };
}

export function setUserUploads(path, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.SET_USER_UPLOADS,
    payload: { path, userInfo },
  };
}

export function uploadFiles(path, files, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.UPLOAD_FILES,
    payload: { path, files, userInfo },
  };
}

export function setCurrentDirectory(directory) {
  return {
    type: BOARD_ACTION_TYPES.SET_CURRENT_DIRECTORY,
    payload: { directory },
  };
}

export function setLoader(loaderType) {
  return {
    type: BOARD_ACTION_TYPES.SET_LOADER,
    payload: { loaderType },
  };
}

export function createFolder(path, name, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.CREATE_FOLDER,
    payload: { path, name, userInfo },
  };
}

export function editFolderName(oldName, newName, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.EDIT_FOLDER_NAME,
    payload: { oldName, newName, userInfo },
  };
}

export function editFileName(id, newName, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.EDIT_FILE_NAME,
    payload: { id, newName, userInfo },
  };
}


export function deleteFiles(files, folders, userInfo) {
  return {
    type: BOARD_ACTION_TYPES.DELETE_FILES,
    payload: { files, folders, userInfo },
  };
}

export function setUploadLimitExceeded(uploadLimitExceeded) {
  return {
    type: BOARD_ACTION_TYPES.SET_UPLOAD_LIMIT_EXCEED,
    payload: { uploadLimitExceeded },
  };
}

export function setUploadSizeExceeded(uploadSizeExceeded) {
  return {
    type: BOARD_ACTION_TYPES.SET_UPLOAD_SIZE_EXCEED,
    payload: { uploadSizeExceeded },
  };
}

export function setEditMode(isEditMode) {
  return {
    type: BOARD_ACTION_TYPES.SET_EDIT_MODE,
    payload: { isEditMode },
  };
}

export function setMatchedPositionName(isPositionMatched) {
  return {
    type: BOARD_ACTION_TYPES.SET_MATCHED_OPENING_POSITION,
    payload: { isPositionMatched },
  };
}

export function setUploadFilterByPos(uploadFilterByPos) {
  return {
    type: BOARD_ACTION_TYPES.SET_UPLOAD_FILTER_BY_POS,
    payload: { uploadFilterByPos },
  };
}

export function setTourType(tourType) {
  return {
    type: BOARD_ACTION_TYPES.SET_TOUR_TYPE,
    payload: { tourType },
  };
}

export function setTourNumber(tourStepNumber) {
  return {
    type: BOARD_ACTION_TYPES.SET_TOUR_NUMBER,
    payload: { tourStepNumber },
  };
}

export function setTourNextStep() {
  return {
    type: BOARD_ACTION_TYPES.SET_TOUR_NEXT_STEP,
    payload: {},
  };
}

export function addPgnToArr(newTabPgnStr, tabFile = {}) {
  return {
    type: BOARD_ACTION_TYPES.ADD_PGN_TO_ARR,
    payload: { newTabPgnStr, tabFile },
  };
}

export function removePgnFromArr(removeTabIndx) {
  return {
    type: BOARD_ACTION_TYPES.REMOVE_PGN_FROM_ARR,
    payload: { removeTabIndx },
  };
}

export function setActivePgnTab(newActivePgnTabIndx) {
  return {
    type: BOARD_ACTION_TYPES.SET_ACTIVE_PGN_TAB,
    payload: { newActivePgnTabIndx },
  };
}

export function changeTabName(newTabName, tabIndex) {
  return {
    type: BOARD_ACTION_TYPES.CHANGE_TAB_NAME,
    payload: { newTabName, tabIndex },
  };
}

export function setAnalyzingFenTabIndx(analyzingFenTabIndx) {
  return {
    type: BOARD_ACTION_TYPES.SET_ANALYZING_FEN_TAB_INDX,
    payload: { analyzingFenTabIndx },
  };
}

export function restoreAllPgnArr(allPgnArr, activePgnTab, analysisNotationTab) {
  return {
    type: BOARD_ACTION_TYPES.RESTORE_ALL_PGN_ARR,
    payload: { allPgnArr, activePgnTab, analysisNotationTab },
  };
}

export function applyFullAnalysisOnPGN() {
  return {
    type: BOARD_ACTION_TYPES.APPLY_FULL_ANALYSIS_ON_PGN,
    payload: {},
  };
}

export function setSwitchedTabAnalyzingFen(analyzingFen) {
  return {
    type: BOARD_ACTION_TYPES.SET_SWITCHED_TAB_ANALYZING_FEN,
    payload: { analyzingFen },
  };
}

export function setLichessDB(searchParams, setIsLoading) {
  return {
    type: BOARD_ACTION_TYPES.SET_LICHESS_DB,
    payload: { searchParams, setIsLoading },
  };
}

export function setChessAIResponse() {
  return {
    type: BOARD_ACTION_TYPES.SET_CHESS_AI_RESPONSE,
    payload: {},
  };
}

export function setNavigationGamesInfo(indent, reset) {
  return {
    type: BOARD_ACTION_TYPES.SET_NAV_GAMES_INFO,
    payload: { indent, reset },
  };
}

export default {
  setFen,
  setInitialPgn,
  setPgn,
  doMove,
  setActiveMove,
  promoteVariation,
  deleteRemainingMoves,
  deleteVarsAndComments,
  addNags,
  deleteMoveComment,
  deleteMoveNag,
  addCommentToMove,
  setReference,
  setGameReference,
  setMoveLoader,
  setVariationOpt,
  setActiveFile,
  setUserUploads,
  uploadFiles,
  setCurrentDirectory,
  setLoader,
  createFolder,
  editFolderName,
  deleteFiles,
  setUploadLimitExceeded,
  setUploadSizeExceeded,
  setEditMode,
  setMatchedPositionName,
  setUploadFilterByPos,
  setTourType,
  setTourNumber,
  setTourNextStep,
  addPgnToArr,
  removePgnFromArr,
  setActivePgnTab,
  changeTabName,
  setAnalyzingFenTabIndx,
  restoreAllPgnArr,
  setSwitchedTabAnalyzingFen,
};
