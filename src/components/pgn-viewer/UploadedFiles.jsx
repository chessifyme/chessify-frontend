import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import {
  RiEdit2Line,
  RiUpload2Line,
  RiDeleteBinFill,
  RiFileDownloadLine,
} from 'react-icons/ri';
import {
  setActiveFile,
  setPgn,
  uploadFiles,
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

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    pgnStr: state.board.pgnStr,
    currentDirectory: state.board.currentDirectory,
    loader: state.board.loader,
    activeFileInfo: state.board.activeFileInfo,
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
}) => {
  return (
    <>
      {uploadedFilesCurrent &&
        uploadedFilesCurrent.map((file, index) => {
          return (
            <tr
              className={`uploaded-files ${
                activeFileInfo.file &&
                activeFileInfo.file.key &&
                file.key &&
                file.key === activeFileInfo.file.key
                  ? 'activeFile'
                  : ''
              }`}
              key={file.key + Math.random()}
              onClick={(event) =>
                setActiveFileHandler(event, file, currentDirectory)
              }
            >
              <td>{file.key.split('/')[2]}</td>
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
                    {loader === file.key + '-editLoad' ? (
                      <div className="circle-loader"></div>
                    ) : (
                      <RiEdit2Line
                        className="edit-file"
                        title="Edit Info"
                        onClick={() => {
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
                        onClick={() => {
                          setFilePgn(file, currentDirectory);
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
                        onClick={() => {
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
                        onClick={() => {
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
  pgnStr,
  deleteFiles,
  userFullInfo,
  setActiveTab,
  uploadProgress,
  tourType,
  tourStepNumber,
  setTourNextStep,
  addPgnToArr,
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

  const handlePageClick = (event) => {
    const newOffset =
      (event.selected * itemsPerPage) %
      userUploadedFiles[currentDirectory].length;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    userUploadedFiles &&
      userUploadedFiles[currentDirectory] &&
      uploadedFilesCurrent.forEach((file) => {
        setLoader(file.key + '-editLoad');
        getPgnTags(file.id, userFullInfo.token).then((response) => {
          setPgnInfo((pgnInfo) => {
            return {
              ...pgnInfo,
              [file.id]: response,
            };
          });
          setLoader('');
          if (tourType === 'analyze' && tourStepNumber === 4) {
            setTourNextStep();
          }
        });
      });
  }, [currentDirectory, openEditModal, itemOffset]);

  async function setFilePgn(file, currentDirectory) {
    setLoader(file.key + '-setNotLoad');
    getFiles(file.id, file.path, userFullInfo.token).then((fileContent) => {
      addPgnToArr(fileContent, file);
      setActiveFile(fileContent, file, currentDirectory);
      setActiveTab(0);
      setLoader('');
      if (tourType === 'analyze' && tourStepNumber === 5) {
        setTourNextStep();
      }
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
    getFiles(file.id, file.path, userFullInfo.token).then((fileContent) => {
      let element = window.document.createElement('a');
      element.href = window.URL.createObjectURL(
        new Blob([fileContent], { type: 'application/vnd.chess-pgn' })
      );
      const name = file.key.split('/')[2];

      element.download = name;

      document.body.appendChild(element);
      element.click();

      document.body.removeChild(element);
      setLoader('');
    });
  };

  const setActiveFileHandler = (event, file, currentDirectory) => {
    if (event.detail === 2) {
      setFilePgn(file, currentDirectory);
    }
  };

  return (
    <>
      {uploadProgress.percent !== null && uploadProgress.percent >= 0 ? (
        <div className="uploads-progress">
          <div class="progress position-relative">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: `${uploadProgress.percent}%` }}
              aria-valuenow={uploadProgress.percent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <small class="justify-content-center d-flex position-absolute w-100">
              {uploadProgress.message}
            </small>
          </div>
        </div>
      ) : (
        <Table
          id={`${
            tourType === 'analyze' && tourStepNumber === 5 ? 'uploadedFile' : ''
          }`}
          className="scroll"
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
          <tbody>
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
                  uploadedFilesCurrent={uploadedFilesCurrent}
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
        userFullInfo={userFullInfo}
      />
      <DeleteFilesModal
        isOpen={openDeleteModal}
        setIsOpen={setOpenDeleteModal}
        selectedFiles={deletingFile}
        setSelectedFiles={setDeletingFile}
        deleteFiles={deleteFiles}
        isFile={true}
        userFullInfo={userFullInfo}
        setLoader={setLoader}
      />
    </>
  );
};

export default connect(mapStateToProps, {
  setPgn,
  setActiveFile,
  uploadFiles,
  setLoader,
  deleteFiles,
  addPgnToArr,
})(UploadedFiles);
