import React, { useEffect, useState, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import '@tensorflow/tfjs-backend-cpu';
import * as tflite from '@tensorflow/tfjs-tflite';
import useResizeObserver from '@react-hook/resize-observer';
import { imageConvert } from 'upload-images-converter';
import { connect } from 'react-redux';
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckboxBlankCircleFill,
  RiCloseFill,
} from 'react-icons/ri';
import { TbScanEye, TbEye, TbEyeOff } from 'react-icons/tb';
import { CLOUD_URL } from '../../constants/cloud-params';
import { dataURIToBlob, detectBoards } from '../../utils/utils';
import { setEditMode, setFen, addPgnToArr } from '../../actions/board';
import useKeyPress from './KeyPress';
import Chess from 'chess.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

tflite.setWasmPath(
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.8/dist/'
);

const mapStateToProps = (state) => {
  return {
    userInfo: state.cloud.userInfo,
    pgn: state.board.pgn,
    isGuestUser: state.cloud.isGuestUser,
  };
};

const useSize = (target) => {
  const [size, setSize] = React.useState();

  React.useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

const PdfScanner = ({
  userInfo,
  setEditMode,
  setScannerImg,
  pgn,
  setFen,
  addPgnToArr,
  setLoginModal,
  isGuestUser,
}) => {
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [imagesArr, setImagesArr] = useState([]);
  const [pageNumber, setPageNumber] = useState(null);
  const [scannerModel, setScannerModel] = useState(null);
  const [detectedCoords, setDetectedCoords] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [pdfUploadLoader, setPdfUploadLoader] = useState(false);
  const [hideIcons, setHideIcons] = useState(false);
  const [scannerError, setScannerError] = useState(false);
  const [viewportSize, setViewportSize] = useState([]);
  const [stopAnimation, setStopAnimation] = useState(false);

  const arrowRightPressed = useKeyPress(39);
  const arrowLeftPressed = useKeyPress(37);

  const inputRef = useRef(null);
  const chess = new Chess();
  const target = useRef(null);
  const size = useSize(target);

  const setDetectedButtons = () => {
    const singlePage = document.getElementById('singlePage');
    const pgnHeader = document.getElementsByClassName('react-tabs')[0];

    if (!detectedCoords.length || !singlePage) return;

    const positionPg = singlePage.getBoundingClientRect();
    const positionHeader = pgnHeader.getBoundingClientRect();
    const topDiff = positionPg.top - positionHeader.top;
    const leftDiff = positionPg.left - positionHeader.left;

    detectedCoords.forEach((board, indx) => {
      const left = board.left.toFixed(2) * singlePage.width;
      const bottom = board.bottom.toFixed(2) * singlePage.height;
      const halfWidth =
        (Math.abs(board.right - board.left) * singlePage.width) / 2;
      const scanBtn = document.getElementById(`scanBtn${indx}`);
      scanBtn.style.left = left + halfWidth + leftDiff - 30 + 'px';
      scanBtn.style.top = bottom + topDiff - 30 + 'px';
    });
  };

  useEffect(async () => {
    const model = require('../../../public/assets/tf-model/model.tflite');
    const tfliteModel = await tflite.loadTFLiteModel(model);
    setScannerModel(tfliteModel);
  }, []);

  useEffect(() => {
    if (detectedCoords) {
      setDetectedButtons();
    }
  }, [size]);

  useEffect(() => {
    setDetectedButtons();
    if (hideIcons) {
      let scanBtns = document.querySelectorAll('.scan-pdf-btn');
      scanBtns.forEach((btn) => {
        btn.style.display = 'none';
      });
    }
  }, [detectedCoords]);

  const setNewPage = (indent) => {
    if (pageNumber + indent < imagesArr.length && pageNumber + indent >= 0) {
      setPageNumber(pageNumber + indent);
    }
  };

  useEffect(() => {
    if (arrowLeftPressed && imagesArr.length) {
      setNewPage(-1);
    }
  }, [arrowLeftPressed]);

  useEffect(() => {
    if (arrowRightPressed && imagesArr.length) {
      setNewPage(1);
    }
  }, [arrowRightPressed]);

  const detect = async () => {
    const img = document.getElementById('singlePage');
    const validDetections = await detectBoards(img, scannerModel);
    setDetectedCoords(validDetections);
  };
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const pdfUploadHandler = async (pdfFile) => {
    if (isGuestUser) {
      setLoginModal(true);
      return;
    }
    setPdfUploadLoader(true);
    const linkToPdf = await toBase64(pdfFile);
    try {
      sessionStorage.setItem('chessify_pdf', linkToPdf);
    } catch (e) {
      console.log('COULD NOT LOAD TO SESSION');
    }

    const pdf = pdfjs.getDocument({ url: linkToPdf });
    pdf.promise.then(function (pdf) {
      setUploadedPdf(pdf);
    });
  };

  const renderPages = async () => {
    let imagesArr = [];
    let viewportArr = [];
    const canvas = document.createElement('canvas');
    for (let i = 1; i <= uploadedPdf.numPages; ++i) {
      let page = await uploadedPdf.getPage(i);
      let viewport = page.getViewport({ scale: 2 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      let renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };
      await page.render(renderContext).promise;
      let imgUrl = canvas.toDataURL('image/png');
      let blob = dataURIToBlob(imgUrl);
      let url = window.URL.createObjectURL(blob);
      imagesArr.push(url);
      viewportArr.push({ width: viewport.width, height: viewport.height });
    }
    setImagesArr(imagesArr);
    setViewportSize(viewportArr);
    setPdfUploadLoader(false);
    const pdfPage = sessionStorage.getItem('chessify_pdf_page');
    const linkToPdf = sessionStorage.getItem('chessify_pdf');
    pdfPage && pdfPage.length && linkToPdf && linkToPdf.length
      ? setPageNumber(+pdfPage)
      : setPageNumber(0);
  };

  useEffect(async () => {
    const linkToPdf = sessionStorage.getItem('chessify_pdf');
    const pdfPage = sessionStorage.getItem('chessify_pdf_page');

    if (linkToPdf && linkToPdf.length && pdfPage) {
      setPdfUploadLoader(true);
      const pdf = pdfjs.getDocument({ url: linkToPdf });
      pdf.promise.then(function (pdf) {
        setUploadedPdf(pdf);
      });
    }
  }, []);

  useEffect(() => {
    if (uploadedPdf) {
      renderPages();
    }
  }, [uploadedPdf]);

  useEffect(async () => {
    const model = require('../../../public/assets/tf-model/model.tflite');
    const tfliteModel = await tflite.loadTFLiteModel(model);

    setScannerModel(tfliteModel);
    setDetectedCoords([]);

    if (pageNumber || pageNumber === 0) {
      sessionStorage.setItem('chessify_pdf_page', pageNumber);
    }
    if (imagesArr.length && imagesArr[pageNumber] && scannerModel) {
      detect();
    }
  }, [pageNumber]);

  const outsideClickHandler = () => {
    if (scannerError) setScannerError(false);
  };

  useEffect(() => {
    if (scannerError) {
      document.addEventListener('click', outsideClickHandler);
      return () => {
        document.removeEventListener('click', outsideClickHandler);
      };
    }
  }, [scannerError]);

  const applyFenHandler = (newFen) => {
    if (!pgn.moves || (pgn.moves && !pgn.moves.length && !pgn.headers)) {
      setFen(newFen);
    } else {
      let chessFen = chess.load(newFen);
      if (!chessFen) {
        let fixedNewFen = newFen.slice(0, -1) + '1';
        chess.load(fixedNewFen);
      }
      addPgnToArr(chess.pgn(), {});
    }
  };

  const scanBoardHandler = async (indx) => {
    setStopAnimation(true);
    const boardCoords = detectedCoords[indx];
    const singlePage = document.getElementById('singlePage');

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    let width =
      Math.abs(boardCoords.right - boardCoords.left) *
      viewportSize[pageNumber].width;
    let height =
      Math.abs(boardCoords.top - boardCoords.bottom) *
      viewportSize[pageNumber].height;

    const paddingW = width / 3;
    const paddingH = height / 3;
    width += paddingW;
    height += paddingH;

    canvas.width = width;
    canvas.height = height;

    context.drawImage(
      singlePage,
      boardCoords.left * viewportSize[pageNumber].width - paddingW / 2,
      boardCoords.top * viewportSize[pageNumber].height - paddingH / 2,
      width,
      height,
      0,
      0,
      width,
      height
    );
    let urlC = canvas.toDataURL('image/png');

    let blobC = dataURIToBlob(urlC);
    var file = new File([blobC], 'image.png');
    let transfer = new DataTransfer();
    transfer.items.add(file);
    let fileList = transfer.files;

    let convertedFiles = await imageConvert(
      fileList,
      400,
      400,
      'image/jpeg',
      true
    );
    const url = `${CLOUD_URL}/fen`;
    let data = new FormData();
    data.append('file', convertedFiles[0]);
    data.append('token', userInfo.token);

    const response = await fetch(url, {
      method: 'POST',
      body: data,
    });
    const respJson = await response.json();

    if (response.ok && respJson.fen) {
      applyFenHandler(respJson.fen + ' w - - 0 1');
      window.LichessEditor.setFen(respJson.fen + ' w - - 0 1');
      setEditMode(true);
      setScannerImg(URL.createObjectURL(fileList[0]));
    } else {
      setScannerError(true);
    }
    setStopAnimation(false);
  };

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pdfUploadHandler(e.dataTransfer.files[0]);
    }
  };

  const closePdfHandler = () => {
    setDetectedCoords([]);
    setPageNumber(null);
    setUploadedPdf(null);
    setImagesArr([]);
    sessionStorage.removeItem('chessify_pdf');
    sessionStorage.removeItem('chessify_pdf_page');
  };

  const hideScanHandler = () => {
    let scanBtns = document.querySelectorAll('.scan-pdf-btn');
    if (!scanBtns) return;

    if (!hideIcons) {
      scanBtns.forEach((btn) => {
        btn.style.display = 'none';
        setHideIcons(true);
      });
    } else {
      scanBtns.forEach((btn) => {
        btn.style.display = 'block';
        setHideIcons(false);
      });
    }
  };

  return (
    <div ref={target}>
      {imagesArr.length ? (
        <>
          <div className="pdf-control-icons">
            <div className="pdf-controls">
              <RiArrowLeftLine
                className={`pg-control ${
                  pageNumber - 1 < imagesArr.length && pageNumber - 1 >= 0
                    ? 'active-ctrl'
                    : ''
                }`}
                onClick={() => setNewPage(-1)}
              />
              <RiCheckboxBlankCircleFill className="decore" />
              <RiArrowRightLine
                className={`pg-control ${
                  pageNumber + 1 < imagesArr.length && pageNumber + 1 >= 0
                    ? 'active-ctrl'
                    : ''
                }`}
                onClick={() => setNewPage(1)}
              />
            </div>
            <div>
              {detectedCoords && detectedCoords.length ? (
                !hideIcons ? (
                  <TbEye
                    className="hide-btn-pdf"
                    onClick={() => hideScanHandler()}
                  />
                ) : (
                  <TbEyeOff
                    className="hide-btn-pdf"
                    onClick={() => hideScanHandler()}
                  />
                )
              ) : (
                <></>
              )}
              <RiCloseFill
                className="close-btn-pdf"
                onClick={() => closePdfHandler()}
              />
            </div>
          </div>
          {scannerError && (
            <div className="scanner-error ml-3">
              Something went wrong. Please try again.
            </div>
          )}
          <div className="pdf-wrapper">
            <div className="pdf-imagewrapper">
              <img
                id="singlePage"
                src={imagesArr[pageNumber]}
                alt="pdfImage"
                style={{
                  width: '100%',
                  height: '100%',
                  margin: '0',
                  border: 'none',
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <form
          id="form-file-upload"
          onDragEnter={handleDrag}
          onSubmit={(e) => e.preventDefault()}
          className="mt-2"
        >
          <input
            ref={inputRef}
            type="file"
            id="input-file-upload"
            disabled={pdfUploadLoader}
            onChange={(event) => {
              pdfUploadHandler(event.target.files[0]);
            }}
            accept="application/pdf"
          />
          <label
            id="label-file-upload"
            htmlFor="input-file-upload"
            className={dragActive ? 'drag-active' : ''}
          >
            <div className="d-flex flex-column justify-content-center">
              <p>Drag and drop your PDF file here</p>
              <p> or</p>
              <button className="upload-button mt-2" onClick={onButtonClick}>
                Upload a file instead
              </button>
              {pdfUploadLoader && (
                <div className="circle-loader mt-2 d-flex justify-content-center"></div>
              )}
            </div>
          </label>
          {dragActive && (
            <div
              id="drag-file-element"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            ></div>
          )}
        </form>
      )}
      {detectedCoords && detectedCoords.length ? (
        detectedCoords.map((coords, indx) => {
          return (
            <TbScanEye
              id={`scanBtn${indx}`}
              key={indx}
              className={`scan-pdf-btn ${
                stopAnimation ? '' : 'scan-animation'
              }`}
              onClick={() => {
                scanBoardHandler(indx);
              }}
            />
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
};

export default connect(mapStateToProps, { setEditMode, setFen, addPgnToArr })(
  PdfScanner
);
