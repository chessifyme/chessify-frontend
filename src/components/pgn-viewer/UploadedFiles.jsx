import React, { useState, useEffect, useRef } from 'react';
import Table from 'react-bootstrap/Table';
import {
  RiEdit2Line,
  RiFileEditLine,
  RiUpload2Line,
  RiDeleteBinFill,
  RiFileDownloadLine,
} from 'react-icons/ri';
import { cloneDeep } from 'lodash';
import {
  setActiveFile,
  setPgn,
  setLoader,
  deleteFiles,
  addPgnToArr,
} from '../../actions/board';
import { connect } from 'react-redux';
import ReactPaginate from 'react-paginate';
import { getFiles, getPgnTags } from '../../utils/api';
import FileInfoModal from './FileInfoModal';
import DeleteFilesModal from './DeleteFilesModal';
import { convertResult } from '../../utils/pgn-viewer';
import useKeyPress from './KeyPress';
import PreviewSection from './PreviewSecton';
import EditFileNameModal from './EditFileNameModal';
import { useNavigate } from 'react-router-dom';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgnStr: state.board.pgnStr,
    currentDirectory: state.board.currentDirectory,
    loader: state.board.loader,
    activeFileInfo: state.board.activeFileInfo,
    uploadFilterByPos: state.board.uploadFilterByPos,
  };
};

const Items = ({
  uploadedFilesCurrent,
  setActiveFileHandler,
  activeFileInfo,
  currentDirectory,
  pgnInfo,
  convertResult,
  editFileInfoHandler,
  setFilePgn,
  downloadFileHandler,
  deleteFileHandler,
  loader,
  clickedFileIndx,
  clickedFileRef,
  itemOffset,
  changeFileNameHandler,
  allLoadIsOn,
}) => {
  return (
    <>
      {uploadedFilesCurrent &&
        uploadedFilesCurrent.map((file, index) => {
          const itemProps =
            index === clickedFileIndx ? { ref: clickedFileRef } : {};
          return (
            <tr
              className={`uploaded-files ${
                activeFileInfo.file &&
                activeFileInfo.file.key &&
                file.key &&
                file.key === activeFileInfo.file.key
                  ? 'activeFile'
                  : clickedFileIndx !== null && clickedFileIndx === index
                  ? 'clickedFile'
                  : ''
              }`}
              key={file.key + Math.random()}
              onClick={(event) =>
                setActiveFileHandler(event, file, currentDirectory, index)
              }
              {...itemProps}
            >
              <td className="file-name" title={file.key.split('/')[2]}>
                <span>{index + 1 + itemOffset}.</span>
                {file.key.split('/')[2]}
              </td>
              <td>
                {pgnInfo[file.id] &&
                pgnInfo[file.id].date &&
                pgnInfo[file.id].date !== 'undefined'
                  ? pgnInfo[file.id].date
                  : ''}
              </td>
              <td>
                {pgnInfo[file.id] &&
                pgnInfo[file.id].white &&
                pgnInfo[file.id].white !== 'undefined'
                  ? pgnInfo[file.id].white
                  : ''}
              </td>
              <td>
                {pgnInfo[file.id] &&
                pgnInfo[file.id].black &&
                pgnInfo[file.id].black !== 'undefined'
                  ? pgnInfo[file.id].black
                  : ''}
              </td>
              <td>
                {pgnInfo[file.id] &&
                pgnInfo[file.id].result &&
                pgnInfo[file.id].result !== 'undefined'
                  ? convertResult(pgnInfo[file.id].result)
                  : ''}
              </td>
              <td className="editing-col">
                <div className="d-flex flex-row">
                  <>
                    <RiEdit2Line
                      className="edit-file"
                      title="Edit File Name"
                      onClick={(event) => {
                        event.stopPropagation();
                        changeFileNameHandler(file);
                      }}
                    />
                  </>
                  <>
                    {loader === file.key + '-editLoad' || allLoadIsOn ? (
                      <div className="circle-loader"></div>
                    ) : (
                      <RiFileEditLine
                        className="edit-file"
                        title="Edit Info"
                        onClick={(event) => {
                          event.stopPropagation();
                          editFileInfoHandler(file);
                        }}
                      />
                    )}
                  </>
                  <>
                    {loader === file.key + '-setNotLoad' ? (
                      <div className="circle-loader"></div>
                    ) : (
                      <RiUpload2Line
                        className="edit-file"
                        title="Set to notation"
                        onClick={(event) => {
                          event.stopPropagation();
                          setFilePgn(file, currentDirectory, false);
                        }}
                      />
                    )}
                  </>
                  <>
                    {loader === file.key + '-downloadLoad' ? (
                      <div className="circle-loader"></div>
                    ) : (
                      <RiFileDownloadLine
                        className="edit-file"
                        title="Download File"
                        onClick={(event) => {
                          event.stopPropagation();
                          downloadFileHandler(file, currentDirectory);
                        }}
                      />
                    )}
                  </>
                  <>
                    {loader === file.key + '-deleteLoad' ? (
                      <div className="circle-loader"></div>
                    ) : (
                      <RiDeleteBinFill
                        className="edit-file"
                        title="Delete File"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteFileHandler(file);
                        }}
                      />
                    )}
                  </>
                </div>
              </td>
            </tr>
          );
        })}
    </>
  );
};

const UploadedFiles = ({
  userUploadedFiles,
  currentDirectory,
  setActiveFile,
  loader,
  setLoader,
  activeFileInfo,
  deleteFiles,
  userInfo,
  uploadProgress,
  tourType,
  tourStepNumber,
  setTourNextStep,
  addPgnToArr,
  uploadFilterByPos,
  fen,
  sortByName,
}) => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingFile, setEditingFile] = useState({
    file: '',
    path: '',
    info: '',
  });

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingFile, setDeletingFile] = useState('');
  const [pgnInfo, setPgnInfo] = useState({});
  const [activeVarOpt, setActiveVarOpt] = useState(false);

  const itemsPerPage = 20;
  const [itemOffset, setItemOffset] = useState(0);
  const endOffset = itemOffset + itemsPerPage;
  const uploadedFilesCurrent =
    userUploadedFiles && userUploadedFiles[currentDirectory]
      ? userUploadedFiles[currentDirectory].slice(itemOffset, endOffset)
      : [];
  const pageCount =
    userUploadedFiles && userUploadedFiles[currentDirectory]
      ? Math.ceil(userUploadedFiles[currentDirectory].length / itemsPerPage)
      : 0;
  const [clickedFileIndx, setClickedFileIndx] = useState(null);
  const arrowUpPressed = useKeyPress(38);
  const arrowDownPressed = useKeyPress(40);
  const clickedFileRef = useRef(null);
  const containerRef = useRef(null);
  const [previewPgnStr, setPreviewPgnStr] = useState('');
  const [openEditNameModal, setOpenEditNameModal] = useState(false);
  const [editNameFile, setEditNameFile] = useState({});
  const [allLoadIsOn, setAllLoadIsOn] = useState(false);
  const navigate = useNavigate();

  const handlePageClick = (event) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      userUploadedFiles[currentDirectory].length;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    let pgnIDs = [];
    let respInfo = {};
    userUploadedFiles &&
      userUploadedFiles[currentDirectory] &&
      uploadedFilesCurrent.forEach((file) => {
        pgnIDs.push(file.id);
      });
    setAllLoadIsOn(true);
    if(pgnIDs.length !== 0) {
      getPgnTags(pgnIDs, userInfo.token).then((response) => {
        response.forEach((info, indx) => {
          respInfo[pgnIDs[indx]] = info;
        });
        setPgnInfo(respInfo);
        setAllLoadIsOn(false);
        if (tourType === 'analyze' && tourStepNumber === 4) {
          setTourNextStep();
        }
      });
    }
  }, [
    currentDirectory,
    openEditModal,
    itemOffset,
    sortByName,
    userUploadedFiles,
  ]);

  useEffect(() => {
    if (
      !arrowDownPressed &&
      !activeVarOpt &&
      clickedFileIndx !== null &&
      uploadedFilesCurrent[clickedFileIndx + 1]
    ) {
      setClickedFileIndx(clickedFileIndx + 1);
    }
  }, [arrowDownPressed]);

  useEffect(() => {
    if (
      !arrowUpPressed &&
      !activeVarOpt &&
      clickedFileIndx !== null &&
      uploadedFilesCurrent[clickedFileIndx - 1]
    ) {
      setClickedFileIndx(clickedFileIndx - 1);
    }
  }, [arrowUpPressed]);

  const checkIsVisible = (elem, container) => {
    const elemTop = elem.current.getBoundingClientRect().top;
    const elemBottom = elemTop + elem.current.clientHeight;

    const containerTop = container.current.getBoundingClientRect().top;
    const containerBottom = containerTop + container.current.clientHeight;

    return elemTop > containerTop && elemBottom < containerBottom;
  };

  useEffect(() => {
    if (clickedFileIndx !== null) {
      const inViewport = checkIsVisible(clickedFileRef, containerRef);
      if (!inViewport) {
        clickedFileRef.current.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [clickedFileIndx]);

  useEffect(() => {
    const identifier = setTimeout(() => {
      if (clickedFileIndx !== null) {
        setFilePgn(
          uploadedFilesCurrent[clickedFileIndx],
          currentDirectory,
          true
        );
      }
    }, 500);

    return () => {
      clearTimeout(identifier);
    };
  }, [clickedFileIndx]);

  let uploadedFilesCurr = cloneDeep(userUploadedFiles[currentDirectory]);

  if (userUploadedFiles && userUploadedFiles[currentDirectory] && sortByName) {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    });
    uploadedFilesCurr = uploadedFilesCurr.sort(function (a, b) {
      return collator.compare(a.key, b.key);
    });
  }
  if (
    userUploadedFiles &&
    userUploadedFiles[currentDirectory] &&
    uploadedFilesCurr.length
  ) {
    uploadedFilesCurr = uploadedFilesCurr.slice(itemOffset, endOffset);
  }

  async function setFilePgn(file, currentDirectory, preview) {
    setLoader(file.key + '-setNotLoad');
    if (file.previewInfo && !preview) {
      addPgnToArr(file.previewInfo.pgnStr, file);
      setActiveFile(file.previewInfo.pgnStr, file, currentDirectory);
      navigate({ pathname: "/analysis"});
      setLoader('');
      return;
    }
    getFiles(file.id, file.path, userInfo.token).then((fileContent) => {
      if (!preview) {
        addPgnToArr(fileContent, file);
        setActiveFile(fileContent, file, currentDirectory);
        navigate({ pathname: "/analysis"});
        if (tourType === 'analyze' && tourStepNumber === 5) {
          setTourNextStep();
        }
      } else {
        setPreviewPgnStr(fileContent);
      }
      setLoader('');
    });
  }

  const editFileInfoHandler = (file) => {
    setEditingFile({
      id: file.id,
      name: file.key.split('/')[2],
      info: pgnInfo[file.id],
    });
    setOpenEditModal(true);
  };

  const deleteFileHandler = (file) => {
    setDeletingFile([file.key]);
    setOpenDeleteModal(true);
  };

  const downloadFileHandler = (file) => {
    setLoader(file.key + '-downloadLoad');
    getFiles(file.id, file.path, userInfo.token).then((fileContent) => {
      const regex = /(\n\[\s*FEN\s*((\"\s*\")|(\'\s*\'))\])/gm;
      let cleanContent = fileContent.replace(regex, '');
      let element = window.document.createElement('a');
      element.href = window.URL.createObjectURL(
        new Blob([cleanContent], { type: 'application/vnd.chess-pgn' })
      );
      const name = file.key.split('/')[2];

      element.download = name;

      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
      setLoader('');
    });
  };

  const setActiveFileHandler = (event, file, currentDirectory, index) => {
    if (event.detail === 1) {
      setClickedFileIndx(index);
      setFilePgn(file, currentDirectory, true);
      return;
    }
    if (event.detail >= 2) {
      setFilePgn(file, currentDirectory, false);
      return;
    }
  };

  const changeFileNameHandler = (file) => {
    setEditNameFile(file);
    setOpenEditNameModal(true);
  };

  return (
    <>
      {uploadProgress.percent !== null && uploadProgress.percent >= 0 ? (
        <div className="uploads-progress">
          <div className="progress position-relative">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${uploadProgress.percent}%` }}
              aria-valuenow={uploadProgress.percent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <small className="justify-content-center d-flex position-absolute w-100">
              {uploadProgress.message}
            </small>
          </div>
        </div>
      ) : (
        <Table
          id={`${
            tourType === 'analyze' && tourStepNumber === 5 ? 'uploadedFile' : ''
          }`}
          className="scroll uploaded-files-table"
          hover
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>White</th>
              <th>Black</th>
              <th>Result</th>
              <th className="editing-col-th"></th>
            </tr>
          </thead>
          <tbody ref={containerRef}>
            {loader === 'fileLoader' ? (
              <tr className="isLoading">
                <td>
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </td>
              </tr>
            ) : (
              <></>
            )}
            {loader !== 'fileLoader' &&
            userUploadedFiles &&
            userUploadedFiles[`${currentDirectory}`] ? (
              <>
                <Items
                  uploadedFilesCurrent={uploadedFilesCurr}
                  setActiveFileHandler={setActiveFileHandler}
                  activeFileInfo={activeFileInfo}
                  currentDirectory={currentDirectory}
                  pgnInfo={pgnInfo}
                  convertResult={convertResult}
                  editFileInfoHandler={editFileInfoHandler}
                  setFilePgn={setFilePgn}
                  downloadFileHandler={downloadFileHandler}
                  deleteFileHandler={deleteFileHandler}
                  loader={loader}
                  tourType={tourType}
                  tourStepNumber={tourStepNumber}
                  setTourNextStep={setTourNextStep}
                  clickedFileIndx={clickedFileIndx}
                  clickedFileRef={clickedFileRef}
                  itemOffset={itemOffset}
                  changeFileNameHandler={changeFileNameHandler}
                  allLoadIsOn={allLoadIsOn}
                />
                {userUploadedFiles[`${currentDirectory}`].length <=
                itemsPerPage ? (
                  <></>
                ) : (
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel="Next >"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={5}
                    pageCount={pageCount}
                    previousLabel="< Previous"
                    renderOnZeroPageCount={null}
                    className="uploads-pagination"
                    activeClassName="uploads-active-page"
                    previousClassName="uploads-prev-nx-pg"
                    nextClassName="uploads-prev-nx-pg"
                    disabledClassName="disabled-prev-nx-pg"
                  />
                )}
              </>
            ) : (
              <></>
            )}
          </tbody>
        </Table>
      )}
      <FileInfoModal
        isOpen={openEditModal}
        setIsOpen={setOpenEditModal}
        editingFile={editingFile}
        setLoader={setLoader}
        userInfo={userInfo}
      />
      <DeleteFilesModal
        isOpen={openDeleteModal}
        setIsOpen={setOpenDeleteModal}
        selectedFiles={deletingFile}
        setSelectedFiles={setDeletingFile}
        deleteFiles={deleteFiles}
        isFile={true}
        userInfo={userInfo}
        setLoader={setLoader}
      />
      <EditFileNameModal
        isOpen={openEditNameModal}
        setIsOpen={setOpenEditNameModal}
        selectedFile={editNameFile}
      />
      {clickedFileIndx !== null &&
      uploadedFilesCurr &&
      uploadedFilesCurr[clickedFileIndx] &&
      previewPgnStr.length ? (
        <PreviewSection
          userInfo={userInfo}
          previewFile={uploadedFilesCurr[clickedFileIndx]}
          previewPgnStr={previewPgnStr}
          activeVarOpt={activeVarOpt}
          setActiveVarOpt={setActiveVarOpt}
          setClickedFileIndx={setClickedFileIndx}
          currentDirectory={currentDirectory}
          setFilePgn={setFilePgn}
          uploadFilterByPos={uploadFilterByPos}
          fen={fen}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default connect(mapStateToProps, {
  setPgn,
  setActiveFile,
  setLoader,
  deleteFiles,
  addPgnToArr,
})(UploadedFiles);
