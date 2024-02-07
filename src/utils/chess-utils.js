import Chess from 'chess.js';
import { setPgnHeader, convertResultBack } from './pgn-viewer';
import { INITIAL_FEN } from '../constants/board-params';
import { findRootVariations } from './pgn-viewer';
import { findIndexedPath } from './pgn-viewer';

const chess = new Chess();

export function addMoveNumbersToSans(fullFen, moves) {
  /*
   * This function initially assumed that moves is a list of SAN moves
   */

  const fenParts = fullFen.split(' ');

  let moveNumber = parseInt(fenParts[5]);
  let whitesMove = fenParts[1] === 'w';

  return moves.map((mv, i) => {
    const moveObj = {
      move_number:
        i === 0 && !whitesMove
          ? `${moveNumber}...`
          : whitesMove
            ? `${moveNumber}.`
            : '',
      move: mv[0],
    };

    moveNumber = whitesMove ? moveNumber : moveNumber + 1;
    whitesMove = !whitesMove;

    return moveObj;
  });
}

export function parseProAnalysis(data, fen) {
  const whitesMove = fen.split(' ')[1] === 'w';
  const splitedStringAnalysisData = data.split(' ');

  // If 'bestmove' exists in string, it means analysis is successfully stopped
  const bestMoveIndex = splitedStringAnalysisData.findIndex(
    (str) => str === 'bestmove'
  );

  if (bestMoveIndex !== -1) return { stopped: true };

  const pvIndex = splitedStringAnalysisData.findIndex((str) => str === 'pv');

  if (pvIndex === -1) return null;
  // Moves don't exist in data

  // Get list of moves from Stockfish, parse it to sans with Chess.js and put each move in array to make it like Free Analysis data.
  const movesList = splitedStringAnalysisData.slice(pvIndex + 1);

  let stopped = false;
  let legal = null;
  chess.load(fen);
  movesList.forEach((move) => {
    if (move !== '\n') {
      legal = chess.move(move, { sloppy: true });
      if (!legal) {
        stopped = true;
      }
    }
  });

  if (stopped) {
    return { stopped: true };
  }

  const pgn = chess.history().map((m) => [m]);

  // Which row of analysis to update
  const multiPvNumberIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'multipv') + 1;

  const rowId = multiPvNumberIndex
    ? parseInt(splitedStringAnalysisData[multiPvNumberIndex]) - 1
    : 0;

  // Depth
  const depthIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'depth') + 1;
  const depth = splitedStringAnalysisData[depthIndex];

  // NPS
  const npsIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'nps') + 1;
  const nps = splitedStringAnalysisData[npsIndex];

  // NODES
  const nodesIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'nodes') + 1;
  const nodes = splitedStringAnalysisData[nodesIndex];

  // TBHITS
  const tbhitsIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'tbhits') + 1;
  const tbhits = splitedStringAnalysisData[tbhitsIndex];

  // Score
  let scoreIndex =
    splitedStringAnalysisData.findIndex((str) => str === 'cp') + 1;
  let score = whitesMove
    ? `${parseInt(splitedStringAnalysisData[scoreIndex]) / 100}`
    : `${-parseInt(splitedStringAnalysisData[scoreIndex]) / 100}`;

  if (!scoreIndex) {
    scoreIndex =
      splitedStringAnalysisData.findIndex((str) => str === 'mate') + 1;
    score = whitesMove
      ? `#${parseInt(splitedStringAnalysisData[scoreIndex])}`
      : `#${-parseInt(splitedStringAnalysisData[scoreIndex])}`;
  }

  return {
    rowId,
    depth,
    variation: {
      score,
      nps,
      pgn,
      nodes,
      tbhits,
      arrowShape: movesList.length > 0 ? movesList[0] : '',
    },
  };
}

export const settingHeader = (pgnStr) => {
  if (!pgnStr.length || pgnStr === ' *') {
    return `[SetUp "1"]\n[FEN "${INITIAL_FEN}"]\n\n*`;
  };

  const headers =
    `[Event ""]
[EventDate ""]
[Site ""]
[Date ""]
[Round ""]
[White ""]
[Black ""]
[Result ""]
[WhiteElo ""]
[WhiteTitle ""]
[BlackElo ""]
[BlackTitle ""]
[TimeControl ""]
[UTCDate ""]
[UTCTime ""]
[Variant ""]
[ECO ""]
[Opening ""]
[Annotator ""]
[PlyCount ""]
[SourceTitle ""]
[WhiteTeam ""]
[BlackTeam ""]
[SetUp ""]

`
  return headers + pgnStr;
}

export function downloadPGN(text) {
  chess.load_pgn(text, { sloppy: true });
  let header = setPgnHeader(chess.header());
  const regex = /(\n\[\s*FEN\s*((\"\s*\")|(\'\s*\'))\])/gm;
  text = text.replace(regex, '');
  header = header.replace(regex, '');
  text = header + text;

  let element = window.document.createElement('a');
  element.href = window.URL.createObjectURL(
    new Blob([text], { type: 'application/vnd.chess-pgn' })
  );

  const name = generateFileName() + '.pgn';

  element.download = name;

  document.body.appendChild(element);
  element.click();

  document.body.removeChild(element);
}

export function generateFileName() {
  const date = new Date();
  return `Chessify-${date.getMonth()}-${date.getDate()}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}`;
}

export const getPgnNextMoves = (pgn, fen, doMove) => {
  let foundIndx = null;
  let nextMoves = '';

  const fenArr = fen.split(' ');
  const regex = new RegExp(
    `${fenArr[0]}\\s${fenArr[1]}\\s${fenArr[2]}\\s([^\\s]*)\\s${fenArr[4]}\\s${fenArr[5]}`
  );

  chess.load_pgn(pgn);
  const history = chess.history();
  chess.reset();

  if (regex.test(chess.fen())) {
    foundIndx = 0;
  } else {
    for (let i = 0; i < history.length; i++) {
      chess.move(history[i]);
      let currentFen = chess.fen();
      if (regex.test(currentFen)) {
        foundIndx = i;
      }
    }
  }
  let lastMoveNum = '';
  while (history[foundIndx]) {
    let moveNum = '';
    if (foundIndx % 2 === 0) {
      moveNum = foundIndx / 2 + 1 + '. ';
      lastMoveNum = foundIndx / 2 + 1;
    }
    nextMoves += moveNum + history[foundIndx] + ' ';
    doMove(history[foundIndx]);
    foundIndx += 1;
  }
  return lastMoveNum;
};

export const getPgnEvent = (pgn) => {
  chess.load_pgn(pgn);
  const header = chess.header();
  return header.Event;
};

export const getPgnWithoutHeader = (pgn) => {
  chess.load_pgn(pgn);
  chess.delete_comments();
  pgn = chess.pgn().split('\n\n');
  return pgn[1];
};

const findFenMatchesHelper = (fen, moves, searchingFen, foundMatches) => {
  const chess = new Chess(fen);
  moves.forEach((mv) => {
    const currentFen = chess.fen();
    chess.move(mv.move);
    const nextFen = chess.fen();
    if (nextFen.includes(searchingFen)) {
      foundMatches.push({ fen: nextFen, move: mv });
    }
    if (mv.ravs) {
      mv.ravs.forEach((mvRav) => {
        findFenMatchesHelper(
          currentFen,
          mvRav.moves,
          searchingFen,
          foundMatches
        );
      });
    }
  });
};

export const findFenMatches = (fen, pgn) => {
  const searchingFen = fen.split(' ')[0];
  let fenHeader =
    pgn.headers &&
    pgn.headers.find((header) => header.name === 'FEN') &&
    pgn.headers.find((header) => header.name === 'FEN').value;
  const initalFen = fenHeader || INITIAL_FEN;
  let foundMatches = [];
  if (initalFen.includes(searchingFen)) {
    foundMatches.push({ fen: initalFen, move: {} });
  }
  if (!pgn.moves || (pgn.moves && !pgn.moves.length)) return foundMatches;

  findFenMatchesHelper(initalFen, pgn.moves, searchingFen, foundMatches);

  return foundMatches;
};

export const findNextActiveMove = (activeMove, allMatchedFens, pgn) => {
  const currentIndx = allMatchedFens.findIndex(
    (matchedFen) =>
      matchedFen.move &&
      matchedFen.move.move_id &&
      matchedFen.move.move_id === activeMove.move_id
  );

  let i = currentIndx === allMatchedFens.length - 1 ? 0 : currentIndx + 1;
  let rootVarActive = findRootVariations(activeMove).reverse();
  rootVarActive.push(activeMove.move_id);
  const indexedPathActive = findIndexedPath([pgn], rootVarActive);

  while (true) {
    const matchedMove = allMatchedFens[i].move;
    if (matchedMove.move) {
      let rootVarMatch = findRootVariations(matchedMove).reverse();
      rootVarMatch.push(matchedMove.move_id);
      const indexedPathMatched = findIndexedPath([pgn], rootVarMatch);

      let sameLevel = true;
      if (indexedPathActive.length === indexedPathMatched.length) {
        for (let i = 0; i < indexedPathActive.length; i++) {
          const differentRavs =
            indexedPathActive[i].ravInd !== indexedPathMatched[i].ravInd;
          const differentMoves =
            i !== indexedPathActive.length - 1 &&
            indexedPathActive[i].moveInd !== indexedPathMatched[i].moveInd;
          if (differentRavs || differentMoves) {
            sameLevel = false;
          }
        }
      }
      if (
        !sameLevel ||
        indexedPathActive.length !== indexedPathMatched.length
      ) {
        return matchedMove;
      }
    }

    if (i === currentIndx) {
      return activeMove;
    } else if (!matchedMove.move && activeMove.layer !== 0) {
      return {};
    } else {
      i = i === allMatchedFens.length - 1 ? 0 : +1;
    }
  }
};

export const getPgnData = (fen, pgn) => {
  const moveNumber = fen.split(' ')[5];

  if (moveNumber == 0) {
    return pgn.substr(pgn.indexOf(`\n1. `), 40);
  } else {
    return pgn.substr(pgn.indexOf(`${parseInt(moveNumber)}. `), 40);
  }
};

export const findNextMoveNumFromFen = (fen) => {
  chess.load(fen);
  let moveNumber = fen.split(' ');
  moveNumber = moveNumber[moveNumber.length - 1];
  const color = chess.turn();
  return `${moveNumber}.${color === 'w' ? '' : '..'} `
}
