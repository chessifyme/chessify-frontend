import React, { useEffect, useState } from 'react';
import PreviewVariations from './PreviewVariations';
import PreviewBoard from './PreviewBoard';
import {
  addScoreToPgnStr,
  fixPgnStrCommentPosition,
  modifyMoves,
} from '../../utils/pgn-viewer';
import pgnParser from 'pgn-parser';
import Chess from 'chess.js';
import { RiFile3Fill, RiUpload2Line } from 'react-icons/ri';
import { findFenMatches } from '../../utils/chess-utils';

const PreviewSection = ({
  userInfo,
  previewPgnStr,
  previewFile,
  activeVarOpt,
  setActiveVarOpt,
  setClickedFileIndx,
  setFilePgn,
  currentDirectory,
  uploadFilterByPos,
  fen,
}) => {
  const [previewPgn, setPreviewPgn] = useState({});
  const [previewFen, setPreviewFen] = useState('');
  const [previewActiveMV, setPreviewActiveMV] = useState({});

  const chess = new Chess();

  useEffect(() => {
    let pgnStr = previewPgnStr.trim();
    pgnStr = addScoreToPgnStr(pgnStr);
    pgnStr = fixPgnStrCommentPosition(pgnStr);
    const parsedPGN = pgnParser.parse(pgnStr);

    modifyMoves(parsedPGN[0].moves);

    let ePgnValue = '';

    if (parsedPGN[0].headers && parsedPGN[0].headers.length) {
      let ePgn = parsedPGN[0].headers.filter(
        (e) => e.name === 'ePGN' || e.name === 'ePgn'
      );
      if (ePgn[0] && ePgn[0].value && ePgn[0].value.length) {
        ePgnValue = ePgn[0].value;
        pgnStr = pgnStr.replace(`[ePGN "${ePgnValue}"]`, '').trim();
      }
    }

    const isSet = chess.load_pgn(pgnStr, { sloppy: true });

    if (!isSet) {
      let pgnStr = previewPgnStr.trimEnd();
      if (pgnStr.includes('[FEN "')) {
        setPreviewFen(pgnStr.split('[FEN "')[1].split('"]')[0]);
      }
      return;
    }
    
    let activeMovePreview = {};
    let fenPreview = '';
    if (!uploadFilterByPos) {
      activeMovePreview = [...parsedPGN[0].moves]
        .reverse()
        .find((m) => m.layer === 0);
      fenPreview = chess.fen();
    } else {
      const allMatchedFens = findFenMatches(fen, parsedPGN[0]);
      if (allMatchedFens[0].move) {
        activeMovePreview = allMatchedFens[0].move;
        fenPreview = allMatchedFens[0].fen;
      }
    }

    setPreviewPgn(parsedPGN[0]);
    setPreviewFen(fenPreview);
    setPreviewActiveMV(activeMovePreview);
  }, [previewFile, previewPgnStr]);

  const closePreview = () => {
    setPreviewFen('');
    setPreviewActiveMV({});
    setPreviewPgn({});
    setClickedFileIndx(null);
  };

  const setPreviewToNotation = () => {
    previewFile.previewInfo = {
      fen: previewFen,
      pgn: previewPgn,
      pgnStr: previewPgnStr,
      activeMove: previewActiveMV,
    };
    setFilePgn(previewFile, currentDirectory, false);
    closePreview();
  };

  return (
    <div className="preview-section">
      <div className="preview-info mb-1">
        <div className="preview-filename">
          <RiFile3Fill className="uploaded-icons-file" />
          {previewFile.key.split('/')[1]}/{previewFile.key.split('/')[2]}
        </div>
        <div>
          <button
            className="preview-set-pgn white-button"
            onClick={() => {
              setPreviewToNotation();
            }}
          >
            <RiUpload2Line className="edit-file" /> Set to Notation
          </button>

          <button
            className="preview-close"
            type="button"
            onClick={closePreview}
          >
            <img
              src={require('../../../public/assets/images/pgn-viewer/close-mark.svg')}
              width="20"
              height="20"
              alt=""
            />
          </button>
        </div>
      </div>
      <div className="preview-notations-board">
        <div className="preview-board">
          <PreviewBoard
            fen={previewFen}
            pgn={previewPgn}
            activeMove={previewActiveMV}
            userInfo={userInfo}
          />
        </div>
        <PreviewVariations
          pgn={previewPgn}
          pgnStr={previewPgnStr}
          activeMove={previewActiveMV}
          setPreviewFen={setPreviewFen}
          setPreviewActiveMV={setPreviewActiveMV}
          activeVarOpt={activeVarOpt}
          setActiveVarOpt={setActiveVarOpt}
        />
      </div>
    </div>
  );
};

export default PreviewSection;
