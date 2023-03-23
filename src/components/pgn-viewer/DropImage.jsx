import React, { useState, useRef, useEffect } from "react";
import { imageConvert } from "upload-images-converter";
import Chess from "chess.js";
import { connect } from "react-redux";
import { CLOUD_URL } from "../../constants/cloud-params";
import { setFen, addPgnToArr, setEditMode } from "../../actions/board";

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgnStr: state.board.pgnStr,
    pgn: state.board.pgn,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const DropImage = ({
  pgn,
  userFullInfo,
  addPgnToArr,
  setFen,
  setEditMode,
  setScannerImg,
  handleCloseModal,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [scannerLoader, setScannerLoader] = useState(false);
  const [scannerError, setScannerError] = useState(false);

  const chess = new Chess();

  const outsideClickHandler = () => {
    if (scannerError) setScannerError(false);
  };

  useEffect(() => {
    if (scannerError) {
      document.addEventListener("click", outsideClickHandler);
      return () => {
        document.removeEventListener("click", outsideClickHandler);
      };
    }
  }, [scannerError]);

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const applyFenHandler = (newFen) => {
    if (!pgn.moves || (pgn.moves && !pgn.moves.length && !pgn.headers)) {
      setFen(newFen);
    } else {
      let chessFen = chess.load(newFen);
      if (!chessFen) {
        let fixedNewFen = newFen.slice(0, -1) + "1";
        chess.load(fixedNewFen);
      }
      addPgnToArr(chess.pgn(), {});
    }
    handleCloseModal();
  };

  const handleFiles = async (file) => {
    let convertedFiles = await imageConvert(file, 400, 400, "image/jpeg", true);
    const url = `${CLOUD_URL}/fen`;
    let data = new FormData();
    data.append("file", convertedFiles[0]);
    data.append("token", userFullInfo.token);

    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    const respJson = await response.json();

    if (response.ok && respJson.fen) {
      applyFenHandler(respJson.fen + " w - - 0 1");
      window.LichessEditor.setFen(respJson.fen + " w - - 0 1");
      setEditMode(true);
      setScannerImg(URL.createObjectURL(file[0]));
    } else {
      setScannerError(true);
    }
    setScannerLoader(false);
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setScannerLoader(true);
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setScannerLoader(true);
      handleFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const pasteHandler = (event) => {
    const clipboardItems = event.clipboardData.items;
    const items = [].slice.call(clipboardItems).filter(function (item) {
      return item.type.indexOf("image") !== -1;
    });
    if (items.length === 0) {
      return;
    }

    const item = items[0];
    const blob = item.getAsFile();
    let transfer = new DataTransfer();
    transfer.items.add(blob);
    let fileList = transfer.files;
    setScannerLoader(true);
    handleFiles(fileList);
  };

  useEffect(() => {
    const identifier = setTimeout(() => {
      document.addEventListener("paste", pasteHandler, true);
    }, 1000);

    return () => {
      clearTimeout(identifier);
      document.removeEventListener("paste", pasteHandler, true);
    };
  });

  return (
    <form
      id="form-file-upload"
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        id="input-file-upload"
        onChange={handleChange}
        accept="image/png, image/jpeg, image/jpg, image/svg"
      />
      <label
        id="label-file-upload"
        htmlFor="input-file-upload"
        className={dragActive ? "drag-active" : ""}
      >
        <div className="d-flex flex-column justify-content-center">
          <p>Drag and drop your image here</p>
          <p> or</p>
          <p>Copy it & paste here by pressing Ctrl+V</p>
          <button className="upload-button mt-2" onClick={onButtonClick}>
            Upload a file instead
          </button>
          {scannerLoader && (
            <div className="circle-loader mt-2 d-flex justify-content-center"></div>
          )}
          {scannerError && (
            <div className="scanner-error mt-2">
              Something went wrong. Please try again.
            </div>
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
  );
};

export default connect(mapStateToProps, {
  addPgnToArr,
  setFen,
  setEditMode,
})(DropImage);
