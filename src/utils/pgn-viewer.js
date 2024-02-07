import { CLOUD_URL } from '../constants/cloud-params';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const UPPERCASE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const modifyMoveComments = (mv) => {
  const regex = /(\[%cal\s*.*\])/gm;
  mv.comments.forEach((comment, indx) => {
    if (comment.text && comment.text.length && comment.text.match(regex)) {
      comment.text = comment.text.replace(/\n/g, ' ');
      let commandMatches = comment.text.match(regex);
      if (commandMatches && commandMatches.length) {
        commandMatches.forEach((cMatch) => {
          let valueStr = cMatch.split(' ')[1];
          if (valueStr) {
            valueStr.replace(']', '');
            let values = valueStr.includes(',')
              ? valueStr.split(',')
              : [valueStr];

            if (!mv.comments[indx].commands) mv.comments[indx].commands = [];
            mv.comments[indx].commands.push({
              key: 'cal',
              values: values,
            });
          }
        });
      }
    }
  });
};

export const modifyMoves = (moves, layer = 0, parentMove = null) => {
  moves.forEach((mv, i) => {
    mv.layer = layer;
    mv.prev_move = i ? moves[i - 1] : parentMove;
    mv.move_id = uuidv4();

    if (mv.comments && mv.comments.length) {
      modifyMoveComments(mv);
    }

    if (mv.ravs) {
      mv.ravs.forEach((rav) => {
        modifyMoves(rav.moves, layer + 1, moves[i - 1]);
      });
    }
  });
};

export const getMovesLine = (toMove, moves = []) => {
  if (toMove.prev_move) getMovesLine({ ...toMove.prev_move }, moves);

  const needToRemoveMoveNumber =
    moves[moves.length - 1] &&
    moves[moves.length - 1].move_number === toMove.move_number;

  if (needToRemoveMoveNumber) delete toMove.move_number;

  moves.push(toMove);
};

export const getLinePgn = (chess, activeMove) => {
  if (
    Object.keys(chess.header()).length === 0 &&
    chess.header().constructor === Object
  ) {
    chess.header('White', 'Player 1', 'Black', 'Player 2');
  }
  const pgn = chess.pgn();

  const linePgn = pgn.split('\n\n');
  const moves = [];
  getMovesLine({ ...activeMove }, moves);

  let movesStr = '';
  moves.forEach(
    (mv) =>
      (movesStr += `${mv.move_number ? mv.move_number + '. ' : ''}${mv.move} `)
  );

  linePgn[0] = linePgn[0].split('\n ')[0];
  linePgn[1] = !movesStr.includes('undefined') ? movesStr : ' *';

  return linePgn;
};

export const addMove = (moves, activeMove, moveToAdd) => {
  ////////
  //// Check if variation of the first move
  ////////
  if (!activeMove && moves && moves.length) {
    const newMove = {
      ...moveToAdd,
      layer: 1,
      prev_move: null,
      move_id: uuidv4(),
    };

    if (!moves[0].ravs) moves[0].ravs = [{ moves: [newMove] }];
    else {
      for (let i in moves[0].ravs) {
        if (moves[0].ravs[i].moves[0].move === newMove.move)
          return moves[0].ravs[i].moves[0];
      }

      moves[0].ravs.push({ moves: [newMove] });
    }

    return newMove;
  }

  ////////
  //// Checking if new move already exists in MAIN line
  ////////
  const row = getRowContainingMove(moves, activeMove);

  ////////
  //// For the first move
  ////////
  if (!row) {
    const newMove = {
      ...moveToAdd,
      layer: 0,
      prev_move: null,
      move_id: uuidv4(),
    };
    moves.push(newMove);
    return newMove;
  }

  const curMoveIndexInRow = row.findIndex((mv, i) => {
    return mv.move_id === activeMove.move_id;
  });

  console.log('CUR MOVE INDEX IN ROW: ', curMoveIndexInRow);
  const nextMainMove = row[curMoveIndexInRow + 1]
    ? row[curMoveIndexInRow + 1]
    : null;
  console.log('NEXT MAIN MOVE: ', nextMainMove);
  const moveAlreadyExistsInMain =
    nextMainMove && nextMainMove.move === moveToAdd.move;

  ////////
  //// Checking if new move already exists in RAVS
  ////////
  const nextMoveInRow = row[curMoveIndexInRow + 1];
  const nextRavRow = nextMoveInRow
    ? nextMoveInRow.ravs
      ? nextMoveInRow.ravs.find((rav) => rav.moves[0].move === moveToAdd.move)
      : null
    : null;
  const moveAlreadyExistsInRavs = Boolean(nextRavRow);

  if (moveAlreadyExistsInMain) return nextMainMove;

  if (moveAlreadyExistsInRavs) return nextRavRow.moves[0];

  //Removing move number, if its in main line and is black's move
  if (!nextMainMove && moveToAdd.move_number === activeMove.move_number)
    delete moveToAdd.move_number;

  const newMove = {
    ...moveToAdd,
    layer: nextMainMove ? activeMove.layer + 1 : activeMove.layer,
    prev_move: activeMove,
    move_id: uuidv4(),
  };

  if (!nextMainMove) {
    row.push(newMove);
  } else {
    const move = row[curMoveIndexInRow + 1];
    if (move.ravs) move.ravs.push({ moves: [newMove] });
    else move.ravs = [{ moves: [newMove] }];
  }

  return newMove;
};

export const getRowContainingMove = (moves, move) => {
  if (moves.some((m) => m.move_id === move.move_id)) {
    return moves;
  }

  for (let i in moves) {
    if (moves[i].ravs) {
      for (let j in moves[i].ravs) {
        const row = getRowContainingMove(moves[i].ravs[j].moves, move);
        if (row) return row;
      }
    }
  }
};

const addMoveInPgnStringParts = (move, index, parts) => {
  parts.push(
    `${
      move.move_number
        ? move.move_number +
          '.' +
          `${
            move.prev_move &&
            move.prev_move.move_number &&
            parts.includes(
              `${move.prev_move.move_number}. ${move.prev_move.move} `
            ) &&
            index === 0
              ? '..'
              : ''
          }`
        : parts.length && index === 0
        ? move.prev_move.move_number + '.'
        : ''
    } ${move.move}${
      move.nags
        ? move.nags[1]
          ? ` ${move.nags[0]} ${move.nags[1]}`
          : ` ${move.nags[0]}`
        : ''
    }${addCommentsInPgnStr(move)} `
  );
};

const addCommentsInPgnStr = (move) => {
  let comments = '';
  if (move.comments && move.comments.length) {
    move.comments.forEach((comment) => {
      if (comment.text) {
        comments = comments + ` {${comment.text}}`;
      }
      if (comment.commands) {
        comment.commands.forEach((command) => {
          comments = comments + ` {[%${command.key} ${command.values}]}`;
        });
      }
    });
  }
  return comments;
};

export const addCommentsInNotation = (move) => {
  let commentsStr = '';
  if (move.comments && move.comments.length) {
    move.comments.forEach((comment) => {
      if (comment.text && comment.text.includes('%eval')) {
        commentsStr += comment.text.replace('%eval ', '') + ' ';
      } else if (comment.text) {
        commentsStr += comment.text + ' ';
      }
    });
  }
  return ' ' + commentsStr;
};

// Add score in the Notation section
export const scoreInNotation = (move) => {
  let score = '';
  if (move.move.includes('#')) {
    move.move_number ? (score = ' 1-0') : (score = ' 0-1');
  }
  return score;
};

// Add score in the PGN section
const scoreInPGN = (parts, moves) => {
  parts = parts.join('');
  let lastMove = moves[moves.length - 1].move;
  if (
    parts.includes(Math.ceil(moves.length / 2) + '. ' + lastMove) &&
    lastMove.includes('#')
  ) {
    parts += ' 1-0';
  } else if (lastMove.includes('#')) {
    parts += ' 0-1';
  } else {
    parts += ' *';
  }
  return parts;
};

export const getPgnString = (moves, parts = [], rav_ind = 0) => {
  if (rav_ind !== 0) parts.push(' ) (');
  moves.forEach((move, index) => {
    if (move.ravs) {
      addMoveInPgnStringParts(move, index, parts);
      parts.push(' (');
      move.ravs.forEach((rav, ind) => getPgnString(rav.moves, parts, ind));
      parts.push(') ');
    } else {
      addMoveInPgnStringParts(move, index, parts);
    }
  });

  parts[parts.length - 1] = parts[parts.length - 1].trimEnd();

  if (moves[0].layer === 0) parts = scoreInPGN(parts, moves);

  return parts;
};

export const getPgnHeader = (curHeader) => {
  let headerStr = '';
  curHeader.map((header) => {
    headerStr += `[${header.name} "${header.value}"]\n`;
  });

  return headerStr + '\n';
};

export const getPgnMainComments = (comments) => {
  if (!comments) return '';
  let commentText = '';
  comments.forEach((comment) => {
    if (comment.text) {
      commentText += `{${comment.text}} `;
    } else if (comment.commands) {
      comment.commands.forEach((command) => {
        commentText += `{[%${command.key} ${command.values.join()}]} `;
      });
    }
  });
  return commentText;
};

export const setPgnHeader = (header) => {
  const mainInfo = [
    'Event',
    'EventDate',
    'Site',
    'Date',
    'Round',
    'White',
    'Black',
    'Result',
    'WhiteElo',
    'WhiteTitle',
    'BlackElo',
    'BlackTitle',
    'TimeControl',
    'UTCDate',
    'UTCTime',
    'Variant',
    'ECO',
    'Opening',
    'Annotator',
    'PlyCount',
    'FEN',
    'SourceTitle',
    'WhiteTeam',
    'BlackTeam',
    'SetUp',
  ];
  let hasProp = false;
  mainInfo.map((info) => {
    if (!header.hasOwnProperty(info)) {
      header[info] = '';
    } else {
      delete header[info];
      hasProp = true;
    }
  });

  let headerStr = '';
  for (let head in header) {
    headerStr += `[${head} "${header[head]}"]\n`;
  }
  headerStr += headerStr.length && !hasProp ? '\n' : '';
  return headerStr;
};

export const addScorePGN = (payloadPGN, chess) => {
  if (
    chess.in_checkmate() &&
    !payloadPGN.endsWith('0-1') &&
    !payloadPGN.endsWith('1-0')
  ) {
    if (chess.turn() === 'w') {
      payloadPGN = payloadPGN.slice(0, -1) + ' 0-1';
    } else {
      payloadPGN = payloadPGN.slice(0, -1) + ' 1-0';
    }
  }
  return payloadPGN;
};

export const findRootVariations = (mv, rootVariations = []) => {
  if (mv.layer === 1 && !mv.prev_move) {
    rootVariations.push('');
    return rootVariations;
  }

  if (mv.layer === 0 || !mv.prev_move) {
    return rootVariations;
  }

  if (mv.layer !== mv.prev_move.layer) {
    rootVariations.push(mv.prev_move.move_id);
  }

  return findRootVariations(mv.prev_move, rootVariations);
};

export const findIndexedPath = (pgn, rootVariations, indexedPath = []) => {
  pgn.forEach((pgn_moves, indx) => {
    let moves = pgn_moves.moves;
    const index = moves.findIndex((mv) => {
      return mv.move_id === rootVariations[0];
    });
    if (index >= 0) {
      let holder = {};
      holder.ravInd = indx;
      holder.moveInd = rootVariations.length !== 1 ? index + 1 : index;
      indexedPath.push(holder);
      if (
        rootVariations.length !== 1 &&
        moves[index + 1] &&
        moves[index + 1].ravs
      ) {
        return findIndexedPath(
          moves[index + 1].ravs,
          rootVariations.slice(1),
          indexedPath
        );
      }
    } else if (rootVariations[0].length === 0 && indx === 0) {
      indexedPath.push({ ravInd: 0, moveInd: 0 });
      if (rootVariations.length !== 1 && moves[0] && moves[0].ravs) {
        return findIndexedPath(
          moves[0].ravs,
          rootVariations.slice(1),
          indexedPath
        );
      }
    }
  });
  return indexedPath;
};

const changeLayerNum = (moves, promote = true) => {
  moves.forEach((mv) => {
    if (mv.ravs) {
      mv.layer += promote ? -1 : 1;
      mv.ravs.forEach((mvRav) => {
        changeLayerNum(mvRav.moves, promote);
      });
    } else {
      mv.layer += promote ? -1 : 1;
    }
  });
};

const promoteMove = (nextPgn, lastMove, prelastMove) => {
  let mainLine = nextPgn.ravs[prelastMove.ravInd].moves;
  let demotingMoves = mainLine.splice(prelastMove.moveInd);
  let promotingMoves = demotingMoves[0].ravs[lastMove.ravInd].moves;

  const demotingResult = nextPgn.ravs[prelastMove.ravInd].result;
  const promotingResult = demotingMoves[0].ravs[lastMove.ravInd].result;
  nextPgn.ravs[prelastMove.ravInd].result = promotingResult;

  let promotingMV1st = promotingMoves[0];
  let demotingMV1st = demotingMoves[0];
  promotingMV1st.layer -= 1;
  demotingMV1st.layer += 1;
  const notWhitePromo =
    !demotingMV1st.move_number ||
    (demotingMV1st.move_number &&
      demotingMV1st.move_number !== promotingMV1st.move_number);

  // in case we are promoting a black move, we need to remove its move number.
  if (
    promotingMV1st.move_number &&
    promotingMV1st.prev_move &&
    promotingMV1st.prev_move.move_number &&
    notWhitePromo
  ) {
    demotingMV1st.move_number = promotingMV1st.move_number;
    delete promotingMV1st.move_number;
  }

  demotingMV1st.ravs.splice(lastMove.ravInd, 1);
  if (demotingMV1st.ravs.length) {
    promotingMV1st.ravs = demotingMV1st.ravs;
  }
  delete demotingMV1st.ravs;

  changeLayerNum(demotingMoves.slice(1), false);
  changeLayerNum(promotingMoves.slice(1), true);

  if (promotingMV1st.ravs) {
    promotingMV1st.ravs.push({});
    promotingMV1st.ravs[promotingMV1st.ravs.length - 1].moves = demotingMoves;
    promotingMV1st.ravs[promotingMV1st.ravs.length - 1].result = demotingResult;
  } else {
    promotingMV1st.ravs = [];
    let holder = {};
    holder.moves = demotingMoves;
    holder.result = demotingResult;
    promotingMV1st.ravs.push(holder);
  }

  promotingMoves.forEach((mv) => {
    mainLine.push(mv);
  });
};

export const findLast2MovesOfIndexedPath = (pgn, indexedPath) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  let nextPgn;

  if (indexedPath.length === 2) {
    nextPgn = {};
    nextPgn.ravs = [pgn];
  } else {
    nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
  }

  if (indexedPath.length > 2) {
    return findLast2MovesOfIndexedPath(nextPgn, indexedPath);
  } else {
    promoteMove(nextPgn, indexedPath[1], indexedPath[0]);
  }
};

export const deleteRemainingMV = (pgn, indexedPath) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    const hasNextMove = pgn.moves[moveInd + 1];
    if (hasNextMove) {
      const lastIndx = pgn.moves.length - 1;
      const lastMoveComment =
        pgn.moves[lastIndx].comments &&
        pgn.moves[lastIndx].comments[0] &&
        pgn.moves[lastIndx].comments[0].text;
      const regex = /((0-1)|(1-0)|(½-½))\s\([0-9]+\)\s.*\s\([0-9]+\)-.*\s\([0-9]+\)/gm;
      if (lastMoveComment && lastMoveComment.match(regex)) {
        pgn.moves[moveInd].comments.push({
          text: lastMoveComment,
        });
      }
      pgn.moves.splice(moveInd + 1);
    }
    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return deleteRemainingMV(nextPgn, indexedPath);
  } else {
    const hasNextMove = pgn.ravs[ravInd].moves[moveInd + 1];
    if (hasNextMove) {
      const lastIndx = pgn.ravs[ravInd].moves.length - 1;
      const lastMoveComment =
        pgn.ravs[ravInd].moves[lastIndx].comments &&
        pgn.ravs[ravInd].moves[lastIndx].comments[0] &&
        pgn.ravs[ravInd].moves[lastIndx].comments[0].text;
      const regex = /((0-1)|(1-0)|(½-½))\s\([0-9]+\)\s.*\s\([0-9]+\)-.*\s\([0-9]+\)/gm;
      if (lastMoveComment && lastMoveComment.match(regex)) {
        pgn.ravs[ravInd].moves[moveInd].comments.push({
          text: lastMoveComment,
        });
      }
      pgn.ravs[ravInd].moves.splice(moveInd + 1);
    }
  }
};

export const deleteVarAndReturnParent = (pgn, indexedPath) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  let nextPgn;

  if (indexedPath.length === 2) {
    nextPgn = {};
    nextPgn.ravs = [pgn];
  } else {
    nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
  }
  if (indexedPath.length > 2) {
    return deleteVarAndReturnParent(nextPgn, indexedPath);
  } else {
    let parentOfVar =
      nextPgn.ravs[indexedPath[0].ravInd].moves[indexedPath[0].moveInd];
    parentOfVar.ravs.splice(indexedPath[1].ravInd, 1);
    if (parentOfVar.ravs.length === 0) {
      delete parentOfVar.ravs;
    }
    return parentOfVar;
  }
};

export const checkIsBlackMove = (move) => {
  const { move_number, prev_move } = move;
  const isBlackMove =
    (move_number &&
      prev_move &&
      prev_move.move_number &&
      prev_move.prev_move &&
      !prev_move.prev_move.move_number) ||
    !move_number;
  return isBlackMove;
};

export const convertPieceToSymbol = (move) => {
  const isBlackMove = checkIsBlackMove(move);

  const letters = ['K', 'Q', 'R', 'B', 'N'];
  const symbols_black = ['\u265A', '\u265B', '\u265C', '\u265D', '\u265E'];
  const symbols_white = ['\u2654', '\u2655', '\u2656', '\u2657', '\u2658'];

  const [piece, direction] = splitMovePieceNotation(move);

  const notationLetterIndex = letters.indexOf(piece);
  if (notationLetterIndex !== -1) {
    if (isBlackMove) {
      return [symbols_black[notationLetterIndex], direction];
    } else {
      return [symbols_white[notationLetterIndex], direction];
    }
  }
  return [null, piece + direction];
};

export const splitMovePieceNotation = (move) => {
  return [move.move[0], move.move.slice(1)];
};

export const convertNagsToSymbols = (move) => {
  if (!move.nags) return '';
  let convertedNags = [];
  move.nags.forEach((nag) => {
    switch (nag) {
      case '$1':
        convertedNags.push('\u0021');
        break;
      case '$2':
        convertedNags.push('\u003F');
        break;
      case '$3':
        convertedNags.push('\u203C');
        break;
      case '$4':
        convertedNags.push('\u2047');
        break;
      case '$5':
        convertedNags.push('\u2049');
        break;
      case '$6':
        convertedNags.push('\u2048');
        break;
      case '$11':
        convertedNags.push('\u003D');
        break;
      case '$13':
        convertedNags.push('\u221E');
        break;
      case '$16':
        convertedNags.push('\u00B1');
        break;
      case '$17':
        convertedNags.push('\u2213');
        break;
      case '$18':
        convertedNags.push('\u002B\u002D');
        break;
      case '$19':
        convertedNags.push('\u002D\u002B');
        break;
      case '$132':
        convertedNags.push('\u21C6');
        break;
      case '$22':
      case '$23':
        convertedNags.push('\u2A00');
        break;
      case '$40':
      case '$41':
        convertedNags.push('\u2192');
        break;
      case '$36':
      case '$37':
        convertedNags.push('\u2191');
        break;
      case '$7':
        convertedNags.push('\u25A1');
        break;
      case '$14':
        convertedNags.push(
          require('../../public/assets/images/toolbar-symbols/white-slightly-better-nt.svg')
        );
        break;
      case '$15':
        convertedNags.push(
          require('../../public/assets/images/toolbar-symbols/black-slightly-better-nt.svg')
        );
        break;
      case '$44':
      case '$45':
        convertedNags.push(
          require('../../public/assets/images/toolbar-symbols/compensation-nt.svg')
        );
        break;
    }
  });
  return ' ' + convertedNags.join(' ');
};

export const addNagInMove = (move, nag) => {
  if (!move.nags) {
    move.nags = [nag];
    return;
  }
  const valueNag = ['$3', '$1', '$5', '$6', '$2', '$4', '$7', '$23', '$22'];
  const positionNag = [
    '$18',
    '$16',
    '$11',
    '$13',
    '$17',
    '$19',
    '$132',
    '$14',
    '$15',
    '$44',
    '$45',
    '$40',
    '$41',
    '$36',
    '$37',
  ];

  const isNewValueNag = valueNag.includes(nag);
  const isNewPositionNag = positionNag.includes(nag);

  const isValueNag = valueNag.includes(move.nags[0]);
  const isPositionNag = positionNag.includes(move.nags[0]);

  if (move.nags.length === 1) {
    if ((isValueNag && isNewValueNag) || (isPositionNag && isNewPositionNag)) {
      if (move.nags[0] === nag) {
        delete move.nags;
      } else {
        move.nags[0] = nag;
      }
      return;
    }
    if (isValueNag && isNewPositionNag) {
      move.nags.push(nag);
      return;
    }
    if (isPositionNag && isNewValueNag) {
      move.nags.push(move.nags[0]);
      move.nags[0] = nag;
      return;
    }
  }
  if (move.nags.length === 2) {
    if (isNewValueNag) {
      if (move.nags[0] === nag) {
        move.nags.shift();
      } else {
        move.nags[0] = nag;
      }
      return;
    }
    if (isNewPositionNag) {
      if (move.nags[1] === nag) {
        move.nags.pop();
      } else {
        move.nags[1] = nag;
      }
      return;
    }
  }
};

export const addNagInPgn = (pgn, indexedPath, nag) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    addNagInMove(pgn.moves[moveInd], nag);
    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return addNagInPgn(nextPgn, indexedPath, nag);
  } else {
    addNagInMove(pgn.ravs[ravInd].moves[moveInd], nag);
  }
};

export const deleteMvComment = (pgn, indexedPath) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    pgn.moves[moveInd].comments = [];
    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return deleteMvComment(nextPgn, indexedPath);
  } else {
    pgn.ravs[ravInd].moves[moveInd].comments = [];
  }
};

export const deleteMvNag = (pgn, indexedPath) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    delete pgn.moves[moveInd].nags;
    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return deleteMvNag(nextPgn, indexedPath);
  } else {
    delete pgn.ravs[ravInd].moves[moveInd].nags;
  }
};

export const addCommentToMV = (pgn, indexedPath, comment, commentIndx) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    if (commentIndx === null) {
      const commentObj = { text: comment };
      pgn.moves[moveInd].comments.push(commentObj);
    } else {
      if (comment.length) {
        const commentObj = { text: comment };
        pgn.moves[moveInd].comments[commentIndx] = commentObj;
      } else {
        pgn.moves[moveInd].comments.splice(commentIndx, 1);
      }
    }

    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return addCommentToMV(nextPgn, indexedPath, comment, commentIndx);
  } else {
    if (commentIndx === null) {
      const commentObj = { text: comment };
      pgn.ravs[ravInd].moves[moveInd].comments.push(commentObj);
    } else {
      if (comment.length) {
        const commentObj = { text: comment };
        pgn.ravs[ravInd].moves[moveInd].comments[commentIndx] = commentObj;
      } else {
        pgn.ravs[ravInd].moves[moveInd].comments.splice(commentIndx, 1);
      }
    }
    return;
  }
};

export const addCommandActiveMove = (comments, command, activeMove) => {
  let commandIndx = null;
  comments.forEach((pgnComment, index) => {
    if (pgnComment.commands) {
      commandIndx = index;
    }
  });

  if (commandIndx === null) {
    comments.push({
      commands: [command],
    });
    return activeMove;
  }
  let commandExists = false;

  comments[commandIndx].commands.forEach((pgnCommand, indx) => {
    if (pgnCommand.key === command.key) {
      const text = command.values[0].substring(1);
      const index = pgnCommand.values.findIndex((val) => val.includes(text));
      if (index == -1) {
        pgnCommand.values = [...pgnCommand.values, ...command.values];
      } else {
        if (command.values[0][0] === pgnCommand.values[index][0]) {
          pgnCommand.values.splice(index, 1);
        } else {
          pgnCommand.values.splice(index, 1);
          pgnCommand.values = [...pgnCommand.values, ...command.values];
        }

        if (!pgnCommand.values.length) {
          delete comments[commandIndx].commands[indx];
        }
      }
      commandExists = true;
    }
  });
  if (!commandExists) {
    comments[commandIndx].commands.push(command);
  }
  return activeMove;
};

export const addCommandToMV = (pgn, indexedPath, command) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    addCommandActiveMove(
      pgn.moves[moveInd].comments,
      command,
      pgn.moves[moveInd]
    );
    return;
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return addCommandToMV(nextPgn, indexedPath, command);
  } else {
    addCommandActiveMove(
      pgn.ravs[ravInd].moves[moveInd].comments,
      command,
      pgn.ravs[ravInd].moves[moveInd]
    );
    return;
  }
};

export const findMove = (pgn, indexedPath, nextMove) => {
  const { ravInd, moveInd } = indexedPath[0];
  const isFirstLayer = pgn.moves && pgn.moves[moveInd].layer === 0;

  if (indexedPath.length === 1 && isFirstLayer) {
    return nextMove ? pgn.moves[moveInd + 1] : pgn.moves[moveInd];
  }

  if (indexedPath.length > 1) {
    let nextPgn = isFirstLayer
      ? pgn.moves[moveInd]
      : pgn.ravs[ravInd].moves[moveInd];
    indexedPath = indexedPath.slice(1);
    return findMove(nextPgn, indexedPath);
  } else {
    return nextMove
      ? pgn.ravs[ravInd].moves[moveInd + 1]
      : pgn.ravs[ravInd].moves[moveInd];
  }
};

export const findNextMove = (move, pgn) => {
  let rootVariations = findRootVariations(move).reverse();
  rootVariations.push(move.move_id);
  if (
    pgn &&
    Object.keys(pgn).length === 0 &&
    Object.getPrototypeOf(pgn) === Object.prototype
  ) {
    return;
  }

  const indexedPath = findIndexedPath([pgn], rootVariations);

  if (!indexedPath.length) return null;

  const nextMove = findMove(pgn, indexedPath, true);
  return nextMove;
};

export const checkForMainLineVariation = (moves) => {
  let hasVariation = false;
  if (moves) {
    moves.forEach((move) => {
      if (move.ravs) {
        hasVariation = true;
      }
    });
  }
  return hasVariation;
};

export const checkSubravs = (move) => {
  let hasSubvars = false;
  move.ravs.forEach((rav) => {
    rav.moves.forEach((move) => {
      if (move.ravs) {
        hasSubvars = true;
      }
    });
  });
  return hasSubvars;
};

const isVariationBlackMove = (move) =>
  move.prev_move && move.move_number === move.prev_move.move_number;

export const formatMoveNumber = (move) => {
  let moveNumber = move.move_number ? move.move_number + '. ' : '';

  if (!move.move_number && move.prev_move && move.prev_move.ravs) {
    moveNumber = move.prev_move.move_number;
  }

  const isFirstMove = move.prev_move && move.layer !== move.prev_move.layer;
  if (isFirstMove && isVariationBlackMove(move)) {
    moveNumber = (moveNumber + '').trimEnd() + '.. ';
  } else if (!move.move_number && move.prev_move && move.prev_move.ravs) {
    moveNumber = (moveNumber + '').trimEnd() + '... ';
  } else if (
    move.move_number &&
    move.prev_move &&
    move.prev_move.ravs &&
    move.prev_move.move_number
  ) {
    if (move.prev_move.prev_move && move.prev_move.prev_move.move_number)
      return moveNumber;
    moveNumber = (moveNumber + '').trimEnd() + '.. ';
  }

  return moveNumber;
};

export const getMoveFullInfo = (move, symbolModeEnabled) => {
  const moveNumber = formatMoveNumber(move);
  const [piece, direction] = symbolModeEnabled
    ? convertPieceToSymbol(move)
    : splitMovePieceNotation(move);
  const moveNags = convertNagsToSymbols(move);
  const moveComments = addCommentsInNotation(move);
  const moveFullInfo = {
    moveNumber: moveNumber,
    movePiece: piece,
    moveDirection: direction,
    moveNags: moveNags,
    moveComments: moveComments,
  };
  return moveFullInfo;
};

export const getLineIndexLetter = (lineIndex, parentIndex) => {
  let lineIndexLetter = '';

  if (!parentIndex.length) {
    return UPPERCASE_ALPHABET[lineIndex];
  }

  if (parentIndex.length % 3 === 0) {
    lineIndexLetter = parentIndex + UPPERCASE_ALPHABET[lineIndex];
  } else if (parentIndex.length % 3 === 1) {
    lineIndexLetter = parentIndex + (lineIndex + 1);
  } else {
    lineIndexLetter = parentIndex + ALPHABET[lineIndex];
  }
  return lineIndexLetter;
};

export const sortDataByGameCount = (data) => {
  data.sort((a, b) => {
    return b.games_count - a.games_count;
  });
  return data;
};

export const getReferencesUrl = (fen, searchParams, urlFunc) => {
  let url = `${CLOUD_URL}/dbsearch/${urlFunc}?${'fen=' + fen}`;

  if (!searchParams) return url;

  if (searchParams.whitePlayer && searchParams.whitePlayer.length) {
    searchParams.whitePlayer.map((player) => {
      url += `&white_name=${player}`;
    });
  }

  if (searchParams.blackPlayer && searchParams.blackPlayer.length) {
    searchParams.blackPlayer.map((player) => {
      url += `&black_name=${player}`;
    });
  }

  if (searchParams.whiteElo && searchParams.whiteElo.length) {
    url += `&white_elo_min=${searchParams.whiteElo}`;
  }

  if (searchParams.blackElo && searchParams.blackElo.length) {
    url += `&black_elo_min=${searchParams.blackElo}`;
  }

  if (searchParams.ignoreColor === true || searchParams.ignoreColor === false) {
    url += `&ignore_color=${searchParams.ignoreColor}`;
  }

  if (
    searchParams.ignoreBlitzRapid === true ||
    searchParams.ignoreBlitzRapid === false
  ) {
    url += `&ignore_blitz_rapid=${searchParams.ignoreBlitzRapid}`;
  }

  if (searchParams.resultWins === true || searchParams.resultWins === false) {
    url += `&wins=${searchParams.resultWins}`;
  }

  if (
    searchParams.resultLosses === true ||
    searchParams.resultLosses === false
  ) {
    url += `&loses=${searchParams.resultLosses}`;
  }

  if (searchParams.resultDraws === true || searchParams.resultDraws === false) {
    url += `&draws=${searchParams.resultDraws}`;
  }

  if (searchParams.dateMin && searchParams.dateMin.length) {
    const enteredDateMin = searchParams.dateMin.replaceAll('-', '.');
    url += `&date_min=${enteredDateMin}`;
  }

  if (searchParams.dateMax && searchParams.dateMax.length) {
    const enteredDateMax = searchParams.dateMax.replaceAll('-', '.');
    url += `&date_max=${enteredDateMax}`;
  }

  if (
    urlFunc === 'get_games' &&
    searchParams.order_by &&
    Math.abs(searchParams.order) &&
    searchParams.order_by.length
  ) {
    url += `&order_by=${searchParams.order_by}&order=${searchParams.order}`;
  }

  return url;
};

export const hasSearchParam = (searchParams) => {
  return Object.keys(searchParams).length !== 0;
};

export const convertResult = (result) => {
  if (result === '1') {
    return '1-0';
  } else if (result === '0') {
    return '0-1';
  } else if (result === '1/2') {
    return '½-½';
  }
};

export const convertResultBack = (result) => {
  if (result === '1-0') {
    return '1';
  } else if (result === '0-1') {
    return '0';
  } else if (result === '1/2-1/2') {
    return '1/2';
  }
};

export const modifySearchParam = (searchParams, param) => {
  if (
    !searchParams['ignoreColor'] &&
    param === 'whitePlayer' &&
    searchParams[param].length
  ) {
    return `\u2658 ${searchParams[param]}`;
  }
  if (
    !searchParams['ignoreColor'] &&
    param === 'blackPlayer' &&
    searchParams[param].length
  ) {
    return `\u265E ${searchParams[param]}`;
  }
  if (param === 'whiteElo' && searchParams[param].length) {
    return `White Elo Min: ${searchParams[param]}`;
  }
  if (param === 'blackElo' && searchParams[param].length) {
    return `Black Elo Min: ${searchParams[param]}`;
  }
  if (param === 'dateMin' && searchParams[param].length) {
    return `Date Min: ${searchParams[param]}`;
  }
  if (param === 'dateMax' && searchParams[param].length) {
    return `Date Max: ${searchParams[param]}`;
  }
  if (
    param !== 'ignoreColor' &&
    param !== 'ignoreBlitzRapid' &&
    param !== 'resultWins' &&
    param !== 'resultDraws' &&
    param !== 'resultLosses' &&
    searchParams[param].length
  ) {
    return searchParams[param];
  } else {
    if (param === 'resultDraws' && searchParams[param]) {
      return 'Draws';
    }
    if (param === 'resultWins' && searchParams[param]) {
      return 'Wins';
    }
    if (param === 'resultLosses' && searchParams[param]) {
      return 'Losses';
    }
    if (param === 'ignoreColor' && searchParams[param]) {
      return 'Ignore Color';
    }
    if (param === 'ignoreBlitzRapid' && searchParams[param]) {
      return 'Ignore Blitz and Rapid';
    }
  }
};

export const generateNewFolderName = (userUploads, enteredName) => {
  let counter = 0;
  userUploads &&
    Object.keys(userUploads).length !== 0 &&
    Object.keys(userUploads).map((folder) => {
      if (enteredName === 'New Folder' && folder.startsWith(enteredName)) {
        counter++;
        const regExp = /\(([^)]+)\)/;
        let match = regExp.exec(folder);

        if (match && +match[1] == counter) {
          counter++;
        }
      } else if (folder === enteredName) {
        counter++;
      }
    });

  const generatedName = enteredName + `${counter ? ' (' + counter + ')' : ''}`;
  return generatedName;
};

export const addScoreToPgnStr = (pgnStr) => {
  return pgnStr.endsWith('*') ||
    pgnStr.endsWith('0-1') ||
    pgnStr.endsWith('1-0') ||
    pgnStr.endsWith('1/2-1/2')
    ? pgnStr
    : pgnStr + ' *';
};

export const fixPgnStrCommentPosition = (pgn) => {
  if (!pgn.length) return pgn;

  const regex = /(\(|\))\s?(?<comment>\{([^}]*)})\s?(?<move>([0-9]+\.{1,3}\s)?([^\s|^\)]*(\s?\$[0-9]+){0,2}))/gm;
  let m;
  do {
    m = regex.exec(pgn);
    if (m) {
      pgn = pgn.replace(
        m[0].substring(1),
        ' ' + m.groups.move + ' ' + m.groups.comment
      );
    }
  } while (m);
  return pgn;
};

export const modifyAllPgnArr = (allPgnArr) => {
  allPgnArr.forEach((tabElem) => {
    tabElem.tabPgn = {};
    tabElem.tabActiveMove = {};
    tabElem.tabFile = {};
  });
};

const addRavMoveFromFullAnalysis = (move, moveAnalyse) => {
  const bestMove = moveAnalyse.pgn[0];
  if (!bestMove.length) return move;

  move.ravs = move.ravs && move.ravs.length ? move.ravs : [];
  let mv = {
    comments: [{ text: 'was best' }],
    layer: 1,
    move: bestMove,
    move_id: uuidv4(),
    prev_move: move.prev_move,
  };
  if (move.move_number) mv.move_number = move.move_number;
  move.ravs.push({ moves: [mv], result: null });
  return move;
};

export const applyFullAnalysisResult = (pgn, analysisResult) => {
  const moves = pgn.moves;
  analysisResult.forEach((result, index) => {
    let move = moves[index];
    if (result.type === 'blunder' && (!move.type || move.type !== 'blunder')) {
      move.nags = move.nags ? move.nags : [];
      move.nags[0] = '$4';
      move.comments.push({ text: 'Blunder' });
      move.type = 'blunder';
      move = addRavMoveFromFullAnalysis(move, analysisResult[index - 1]);
    } else if (
      result.type === 'mistake' &&
      (!move.type || move.type !== 'mistake')
    ) {
      move.nags = move.nags ? move.nags : [];
      move.nags[0] = '$2';
      move.comments.push({ text: 'Mistake' });
      move.type = 'mistake';
      move = addRavMoveFromFullAnalysis(move, analysisResult[index - 1]);
    } else if (
      result.type === 'inaccuracy' &&
      (!move.type || move.type !== 'inaccuracy')
    ) {
      move.nags = move.nags ? move.nags : [];
      move.nags[0] = '$6';
      move.comments.push({ text: 'Inaccuracy' });
      move.type = 'inaccuracy';
      move = addRavMoveFromFullAnalysis(move, analysisResult[index - 1]);
    }
    if (!move.comments.some((e) => e.text === `%eval ${result.score}`)) {
      move.comments.push({ text: `%eval ${result.score}` });
    }
  });
  return pgn;
};

export const findLinkTabIndex = (url) => {
  const tabs = [
    'notation',
    'chess-database',
    'lichess-database',
    'cloud-storage',
    'video-search',
    'chess-pdf-scanner',
  ];
  let foundTab = 0;
  tabs.forEach((tab, index) => {
    if (url.includes('/' + tab)) {
      foundTab = index;
    }
  });
  return foundTab;
};

export const getLinkFromIndex = (index) => {
  const tabs = [
    'notation',
    'chess-database',
    'lichess-database',
    'cloud-storage',
    'video-search',
    'chess-pdf-scanner',
  ];
  return '/analysis' + (index ? '/' + tabs[index] : '');
};

export default {
  uuidv4,
  modifyMoves,
  getMovesLine,
  getRowContainingMove,
  addMove,
  getPgnString,
  scoreInNotation,
  addScorePGN,
  findRootVariations,
  findIndexedPath,
  findLast2MovesOfIndexedPath,
  deleteRemainingMV,
  deleteVarAndReturnParent,
  convertNagsToSymbols,
  deleteMvComment,
  deleteMvNag,
  addCommentToMV,
  addCommentsInNotation,
  checkForMainLineVariation,
  checkSubravs,
  getMoveFullInfo,
  getLineIndexLetter,
  sortDataByGameCount,
  getReferencesUrl,
  convertResult,
  convertResultBack,
  modifySearchParam,
  generateNewFolderName,
  checkIsBlackMove,
  formatMoveNumber,
  findNextMove,
  addScoreToPgnStr,
  fixPgnStrCommentPosition,
  getLinePgn,
  modifyAllPgnArr,
  applyFullAnalysisResult,
};
