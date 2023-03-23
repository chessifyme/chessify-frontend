import Chess from 'chess.js';
import { setPgnHeader, convertResultBack } from './pgn-viewer';

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
  if (pvIndex === -1) return null; // Moves don't exist in data

  // Get list of moves from Stockfish, parse it to sans with Chess.js and put each move in array to make it like Free Analysis data.
  const movesList = splitedStringAnalysisData.slice(pvIndex + 1);

  let stopped = false;
  let legal = null;
  let chessFen = chess.load(fen);
  if (!chessFen) {
    let fixedNewFen = fen.slice(0, -1) + '1';
    chess.load(fixedNewFen);
  }
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
    },
  };
}

export const settingHeader = (pgnStr) => {
  chess.load_pgn(pgnStr, { sloppy: true });
  let header = setPgnHeader(chess.header());
  header += pgnStr.startsWith('[SetUp') ? '' : '\n';
  return header + pgnStr;
};

export function downloadPGN(text) {
  chess.load_pgn(text, { sloppy: true });
  let header = setPgnHeader(chess.header());
  text = header + (header.length ? '\n' : '') + text;

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

export function getPgnFileHeader(pgnStr) {
  const chess = new Chess();
  chess.load_pgn(pgnStr, { sloppy: true });
  const header = chess.header();
  return {
    white: header.White && header.White.length ? header.White : null,
    black: header.Black && header.Black.length ? header.Black : null,
    whiteElo:
      header.WhiteElo && header.WhiteElo.length ? header.WhiteElo : null,
    blackElo:
      header.BlackElo && header.BlackElo.length ? header.BlackElo : null,
    ecoCode: header.ECO && header.ECO.length ? header.ECO : null,
    date: header.Date && header.Date.length ? header.Date : null,
    tournament: header.Event && header.Event.length ? header.Event : null,
    round:
      header.Round &&
      header.Round.split('.')[0] &&
      header.Round.split('.')[0].length
        ? header.Round.split('.')[0]
        : null,
    subround:
      header.Round &&
      header.Round.split('.')[1] &&
      header.Round.split('.')[1].length
        ? header.Round.split('.')[1]
        : null,
    result:
      header.Result && header.Result.length
        ? convertResultBack(header.Result)
        : null,
    annotator:
      header.Annotator && header.Annotator.length ? header.Annotator : null,
    source:
      header.SourceTitle && header.SourceTitle.length
        ? header.SourceTitle
        : null,
    whiteTeam:
      header.WhiteTeam && header.WhiteTeam.length ? header.WhiteTeam : null,
    blackTeam:
      header.BlackTeam && header.BlackTeam.length ? header.BlackTeam : null,
  };
}

export const getPgnNextMoves = (pgn, fen) => {
  let foundIndx = null;
  let nextMoves = '';
  let numOfMv = 1;

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
        foundIndx = i + 1;
      }
    }
  }
  while (history[foundIndx] && numOfMv <= 10) {
    let moveNum = '';
    if (foundIndx % 2 === 0) {
      moveNum = foundIndx / 2 + 1 + '. ';
    } else if (numOfMv === 1) {
      moveNum = '...';
    }
    nextMoves += moveNum + history[foundIndx] + ' ';
    foundIndx += 1;
    numOfMv++;
  }

  return nextMoves;
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

export const getPgnData = (pgn, fen) => {
  chess.load_pgn(pgn);
  const title = chess.header().Event;
  chess.delete_comments();
  pgn = chess.pgn().split('\n\n');
  const pgnWithoutHeader = pgn[1];

  let foundIndx = null;
  let pgnNextMoves = '';
  let numOfMv = 1;

  const fenArr = fen.split(' ');
  const regex = new RegExp(
    `${fenArr[0]}\\s${fenArr[1]}\\s${fenArr[2]}\\s([^\\s]*)\\s${fenArr[4]}\\s${fenArr[5]}`
  );

  const history = chess.history();
  chess.reset();

  if (regex.test(chess.fen())) {
    foundIndx = 0;
  } else {
    for (let i = 0; i < history.length; i++) {
      chess.move(history[i]);
      let currentFen = chess.fen();
      if (regex.test(currentFen)) {
        foundIndx = i + 1;
      }
    }
  }
  while (history[foundIndx] && numOfMv <= 10) {
    let moveNum = '';
    if (foundIndx % 2 === 0) {
      moveNum = foundIndx / 2 + 1 + '. ';
    } else if (numOfMv === 1) {
      moveNum = '...';
    }
    pgnNextMoves += moveNum + history[foundIndx] + ' ';
    foundIndx += 1;
    numOfMv++;
  }

  return { title, pgnWithoutHeader, pgnNextMoves };
};
