import * as tf from '@tensorflow/tfjs-core';
import * as tflite from '@tensorflow/tfjs-tflite';
import { INITIAL_FEN } from '../constants/board-params';

tflite.setWasmPath(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/'
);

export function correctionFen(fen) {
  if (
    fen.length &&
    fen[fen.length - 6] &&
    fen[fen.length - 6].match(/[a-z]/i)
  ) {
    return (
      fen.substring(0, fen.length - 6) +
      '-' +
      fen.substring(fen.length - 5 + '-'.length)
    );
  }
  return fen;
}

export function recoverLastSession(
  restoreAllPgnArr,
  setFen,
  setAnalyzingFenTabIndx
) {
  const activeTab = +sessionStorage.getItem('chessify_active_notation_tab');
  const analysisNotationTab = sessionStorage.getItem(
    'chessify_analysis_notation_tab'
  );
  const notationPgnTabArr = JSON.parse(
    sessionStorage.getItem('chessify_notation_tab_arr')
  );
  if (Boolean(sessionStorage.getItem('tabs'))) {
    setAnalyzingFenTabIndx(activeTab);
  }
  if (
    (activeTab || activeTab === 0) &&
    notationPgnTabArr &&
    notationPgnTabArr.length &&
    ((notationPgnTabArr[activeTab].tabPgnStr &&
      notationPgnTabArr[activeTab].tabPgnStr.length > 2) ||
      notationPgnTabArr.length > 1)
  ) {
    let loadLast = window.confirm('Load the last session?');

    if (loadLast === true) {
      restoreAllPgnArr(notationPgnTabArr, activeTab, analysisNotationTab);
    } else {
   
      if (Boolean(sessionStorage.getItem('tabs'))) {
        setAnalyzingFenTabIndx(0);
      }
      sessionStorage.removeItem('chessify_active_notation_tab');
      sessionStorage.removeItem('chessify_analysis_notation_tab');
      sessionStorage.removeItem('chessify_notation_tab_arr');
      restoreLink(setFen);
    }
  } else {
    restoreLink(setFen);
  }
}

const restoreLink = (setFen) => {
  const url = new URL(window.location.href);
  const fenFromUrl =
    url.searchParams.get('fen') !== null
      ? url.searchParams.get('fen')
      : INITIAL_FEN;
  if (fenFromUrl.length) {
    const fen = correctionFen(fenFromUrl);
    setFen(fen);
  }
};

export const getInitalFenUrl = () => {
  let initalFenUrl = '';
  const url = new URL(window.location.href);
  const fenFromUrl =
    url.searchParams.get('fen') !== null
      ? url.searchParams.get('fen')
      : INITIAL_FEN;
  if (fenFromUrl.length) {
    initalFenUrl = correctionFen(fenFromUrl);
  }
  return initalFenUrl;
};

export function showEngineInfo(type) {
  switch (type) {
    case 'Temp':
      return 'The server will connect in 2-3 minutes. Meanwhile, you can analyze on 10MN/s server for Free.';
    case 'Delayed':
      return 'Sorry, additional 2-3 minutes are needed for server allocation.';
    case 'Try Later':
      return 'Sorry, but this time your order could not be completed. Please try later.';
    default:
      return 'Free analysis on a server of up to 100,000 kN/s speed';
  }
}

export function clearSavedAnalyzeInfoFromSessionStorage() {
  if (sessionStorage.getItem('latest_analyze_info')) {
    sessionStorage.removeItem('latest_analyze_info');
  }
}

export function checkForUnlimitedPopUp(serverInfo, plans) {
  let needsAnalyzeCheck = false;
  const { servers } = serverInfo;
  if (!servers) return needsAnalyzeCheck;
  if (!plans) return needsAnalyzeCheck;

  const isSubscriptionUnlim =
    plans.subscription &&
    (parseInt(plans.subscription.product_id) === 22 ||
      parseInt(plans.subscription.product_id) === 23 ||
      parseInt(plans.subscription.product_id) === 25 ||
      parseInt(plans.subscription.product_id) === 33 ||
      parseInt(plans.subscription.product_id) === 34 ||
      parseInt(plans.subscription.product_id) === 35 ||
      parseInt(plans.subscription.product_id) === 36 ||
      parseInt(plans.subscription.product_id) === 37 ||
      parseInt(plans.subscription.product_id) === 38 ||
      parseInt(plans.subscription.product_id) === 39 ||
      parseInt(plans.subscription.product_id) === 40 ||
      parseInt(plans.subscription.product_id) === 41 ||
      parseInt(plans.subscription.product_id) === 42);

  for (const [engine, params] of Object.entries(servers)) {
    if (
      params[0] &&
      (params[0].cores === 32 ||
        params[0].cores === 16 ||
        (params[0].cores === 100 && isSubscriptionUnlim))
    ) {
      needsAnalyzeCheck = true;
    }
  }
  return needsAnalyzeCheck;
}

export function filterUnlimitedServerNames(servers, plans) {
  if (!plans) return [];
  if (!servers.servers) return [];

  let unlimitedNames = [];

  const isSubscriptionUnlim =
    plans.subscription &&
    (parseInt(plans.subscription.product_id) === 22 ||
      parseInt(plans.subscription.product_id) === 23 ||
      parseInt(plans.subscription.product_id) === 25);

  for (const [engine, params] of Object.entries(servers.servers)) {
    if (
      params[0] &&
      (params[0].cores === 32 ||
        params[0].cores === 16 ||
        (params[0].cores === 100 && isSubscriptionUnlim))
    ) {
      unlimitedNames.push(engine);
    }
  }
  return unlimitedNames;
}

export function switchToBoard(
  setFen,
  setBoardOrientation,
  setEditMode,
  isEditMode,
  setPgn,
  fen
) {
  const url_string = window.location.href;
  const url = new URL(url_string);
  const fenFromUrl = url.searchParams.get('fen');
  const orientation = window.LichessEditor.getOrientation();
  if (fenFromUrl && fenFromUrl !== fen) {
    window.confirm(
      'Your current position will be reset. Are you sure you want set new position?'
    ) && setFen(correctionFen(fenFromUrl));
  }
  setBoardOrientation(orientation);
  setEditMode(!isEditMode);
}

export function matchFenWithPopularPosition(boardFen, popularPositionArray) {
  return popularPositionArray.find(
    ({ fen }) => fen === correctionFen(boardFen)
  );
}

export function disableDecodeChessButton(plans) {
  const { balance, decode_trial_passed, decode_chess } = plans;
  if (decode_trial_passed === false) {
    return false;
  }
  if (decode_chess !== null || balance >= 20) {
    return false;
  }
  return true;
}

export function showDecodeChessSpecialOfferSection(plans) {
  const { decode_chess } = plans;
  if (decode_chess === null) {
    return true;
  }
  return false;
}

const YOUTUBE_PLAYLIST_ITEMS_API =
  'https://www.googleapis.com/youtube/v3/playlistItems';
const YOUTUBE_API_KEY = 'AIzaSyBi8PP8aBM0u1Z7c7SKI6rcoO6t7fXtF6c';
const PLAYLIST_ID = 'PL4hIB5mj1H1EQRWnjwgVfNUSJzgr9Wiml';

export async function getServerSideProps() {
  const res = await fetch(
    `${YOUTUBE_PLAYLIST_ITEMS_API}?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  return data;
}

export const dataURIToBlob = (dataURI) => {
  let byteString = atob(dataURI.split(',')[1]);
  let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  let arrayBuffer = new ArrayBuffer(byteString.length);
  let _ia = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i);
  }
  let dataView = new DataView(arrayBuffer);
  let blob = new Blob([dataView], { type: mimeString });
  return blob;
};

export function filterAlphanumeric(username) {
  return username
    .split('')
    .filter((char) => /^[a-z0-9]$/i.test(char))
    .join('');
}

export const detectBoards = async (img, model) => {
  let inputTensor = tf.browser.fromPixels(img);

  inputTensor = tf.image.resizeBilinear(inputTensor, [300, 300]);
  inputTensor = tf.cast(inputTensor, 'int32');
  inputTensor = tf.expandDims(inputTensor);

  const result = model.predict(inputTensor);

  let boxes = Array.from(await result['TFLite_Detection_PostProcess'].data());
  let scores = Array.from(
    await result['TFLite_Detection_PostProcess:2'].data()
  );

  let boxes2D = [];

  for (let i = 0; i < boxes.length / 4; i++) {
    boxes2D.push([
      boxes[i * 4],
      boxes[i * 4 + 1],
      boxes[i * 4 + 2],
      boxes[i * 4 + 3],
    ]);
  }

  const clean = await tf.image.nonMaxSuppressionAsync(
    boxes2D,
    scores,
    20,
    0.3,
    0.98
  );

  const cleanIndx = clean.dataSync();

  let validDetections = [];

  cleanIndx.forEach((cIndex) => {
    validDetections.push({
      top: boxes2D[cIndex][0],
      left: boxes2D[cIndex][1],
      bottom: boxes2D[cIndex][2],
      right: boxes2D[cIndex][3],
    });
  });
  return validDetections;
};

export const getHelmetInfo = (urlPath) => {
  const helmetInfos = {
    '/analysis': {
      title: 'Chessify Cloud Engine Analysis - Online Dashboard',
      description:
        'Up your chess game with the best features - fast cloud analysis with the strongest engines like Stockfish 16 & Lc0, a free online game database, and more.',
    },
    '/analysis/account_settings': {
      title: 'Chessify Account Settings',
      description:
        'Manage your Chessify account: change your personal info, find your referral link, see your plan details, or upgrade/cancel your subscription.',
    },
    '/analysis/chess-database': {
      title: 'Online Chess Database with 9+ Million Games',
      description:
        'Find grandmaster games, prepare for opponents, and explore chess openings with the biggest online mega chess database with over 9 Million games, updated weekly.',
    },
    '/analysis/lichess-database': {
      title: 'Lichess Open Database - Online Games & Opening Reference',
      description:
        'Find your online games and explore the most popular chess openings played on lichess.org with our up-to-date Lichess database of billions of online games.',
    },
    '/analysis/video-search': {
      title: 'Chess Video Search - Find Relevant YouTube Videos',
      description:
        'Find YouTube videos that match your in-game chess positions. Search with your chessboard instead of words and easily find content on any opening with Chessify.',
    },
    '/analysis/cloud-storage': {
      title: 'Chessify Cloud Storage - Save Games & Databases',
      description:
        "Store and access your chess games and databases safely from any device with Chessify's unlimited cloud storage. A hassle-free way to manage your chess data.",
    },
    '/analysis/chess-pdf-scanner': {
      title: 'Chessify PDF Scanner - Digitize Chess Books',
      description:
        'Upload chess PDFs to Chessify for easy reading & scanning. Convert book puzzles to digital format & analyze them with powerful engines like Stockfish 16 online.',
    },
  };
  return helmetInfos[urlPath];
};

export default {
  clearSavedAnalyzeInfoFromSessionStorage,
  recoverLastSession,
  showEngineInfo,
  checkForUnlimitedPopUp,
  switchToBoard,
  correctionFen,
  matchFenWithPopularPosition,
  disableDecodeChessButton,
  showDecodeChessSpecialOfferSection,
  getServerSideProps,
  dataURIToBlob,
  detectBoards,
  filterAlphanumeric,
  getHelmetInfo,
};
