import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import {
  addNags,
  deleteRemainingMoves,
  deleteVariation,
  deleteVarsAndComments,
  promoteVariation,
  deleteMoveComment,
  deleteMoveNag,
  addCommentToMove,
} from '../../actions/board';
import SavePgnUploadModal from './SavePgnUploadModal';
import { setUserUploads } from '../../actions/board';
import {
  checkIsBlackMove,
  generateNewFolderName,
} from '../../../src/utils/pgn-viewer';

const tools = [
  {
    nag: '$3',
    symbol: require('../../../public/assets/images/toolbar-symbols/very-good-move.svg'),
    title: 'Very Good Move',
  },
  {
    nag: '$1',
    symbol: require('../../../public/assets/images/toolbar-symbols/good-move.svg'),
    title: 'Good Move',
  },
  {
    nag: '$5',
    symbol: require('../../../public/assets/images/toolbar-symbols/interesting-move.svg'),
    title: 'Interesting Move',
  },
  {
    nag: '$6',
    symbol: require('../../../public/assets/images/toolbar-symbols/dubious-move.svg'),
    title: 'Dubious Move',
  },
  {
    nag: '$2',
    symbol: require('../../../public/assets/images/toolbar-symbols/bad-move.svg'),
    title: 'Bad Move',
  },
  {
    nag: '$4',
    symbol: require('../../../public/assets/images/toolbar-symbols/very-bad-move.svg'),
    title: 'Very Bad Move',
  },
  {
    nag: '$7',
    symbol: require('../../../public/assets/images/toolbar-symbols/only-move.svg'),
    title: 'Only Move',
    size: 15,
  },
  {
    nag: '$22',
    symbol: require('../../../public/assets/images/toolbar-symbols/zugzwang.svg'),
    title: 'Zugzwang',
    size: 27,
  },
  {
    nag: '$18',
    symbol: require('../../../public/assets/images/toolbar-symbols/white-winning.svg'),
    title: 'White is Winning',
  },
  {
    nag: '$16',
    symbol: require('../../../public/assets/images/toolbar-symbols/white-better.svg'),
    title: 'White is Better',
  },
  {
    nag: '$11',
    symbol: require('../../../public/assets/images/toolbar-symbols/even.svg'),
    title: 'Even',
  },
  {
    nag: '$13',
    symbol: require('../../../public/assets/images/toolbar-symbols/unclear.svg'),
    title: 'Unclear',
  },
  {
    nag: '$17',
    symbol: require('../../../public/assets/images/toolbar-symbols/black-better.svg'),
    title: 'Black is Better',
  },
  {
    nag: '$19',
    symbol: require('../../../public/assets/images/toolbar-symbols/black-winning.svg'),
    title: 'Black is Winning',
  },
  {
    nag: '$14',
    symbol: require('../../../public/assets/images/toolbar-symbols/white-slightly-better.svg'),
    title: 'White is slightly better',
    size: 27,
  },
  {
    nag: '$15',
    symbol: require('../../../public/assets/images/toolbar-symbols/black-slightly-better.svg'),
    title: 'Black is slightly better',
    size: 27,
  },
  {
    nag: '$132',
    symbol: require('../../../public/assets/images/toolbar-symbols/counterplay.svg'),
    title: 'Counterplay',
  },
  {
    nag: '$44',
    symbol: require('../../../public/assets/images/toolbar-symbols/compensation.svg'),
    title: 'Compensation',
  },
];

const mapStateToProps = (state) => {
  return {
    activeMove: state.board.activeMove,
    userUploads: state.board.userUploads,
    userFullInfo: state.cloud.userFullInfo,
  };
};

const Toolbar = (props) => {
  const {
    activeMove,
    deleteVarsAndComments,
    deleteRemainingMoves,
    addNags,
    promoteVariation,
    deleteVariation,
    isCommentField,
    setCommentField,
    addCommentToMove,
    userFullInfo,
    userUploads,
    setUserUploads,
  } = props;

  const [commentText, setCommentText] = useState('');
  const [uploadPgnModal, setUploadPgnModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    setCommentText(commentText);
  }, [commentText]);

  const uploadPgnCloudHandler = () => {
    if (
      userUploads &&
      Object.keys(userUploads).length === 0 &&
      !userUploads.hasOwnProperty('noExistingFilesErrorMessage')
    ) {
      setIsLoading(true);
      setUserUploads('/', userFullInfo).then(({ payload }) => {
        setUploadPgnModal(true);
        setIsLoading(false);
        setNewFolderName(
          generateNewFolderName(payload.userUploads, 'New Folder')
        );
      });
    } else {
      setUploadPgnModal(true);
      setNewFolderName(generateNewFolderName(userUploads, 'New Folder'));
    }
  };

  const addNagsHandler = (activeMove, nag) => {
    if (nag === '$22') {
      nag = checkIsBlackMove(activeMove) ? '$23' : nag;
    }
    addNags(activeMove, nag);
  };

  return (
    <div className="toolbar">
      <div className="d-flex flex-lg-row flex-md-column justify-content-between mt--2 tools-div">
        <div>
          <button
            title="Promote Variation"
            className="toolbar-item"
            onClick={() => {
              promoteVariation(activeMove);
            }}
          >
            <img
              height={30}
              src={require('../../../public/assets/images/toolbar-symbols/promote.svg')}
              alt="Promote"
            />
          </button>
          <button
            title="Delete Variation"
            className="toolbar-item"
            onClick={() => {
              deleteVariation(activeMove);
            }}
          >
            <img
              height={30}
              src={require('../../../public/assets/images/toolbar-symbols/delete-variation.svg')}
              alt="Delete Var"
            />
          </button>
          <button
            title="Delete Remaining Moves"
            className="toolbar-item"
            onClick={() => {
              deleteRemainingMoves(activeMove);
            }}
          >
            <img
              height={30}
              src={require('../../../public/assets/images/toolbar-symbols/delete-remaining-moves.svg')}
              alt="Delete Remaining"
            />
          </button>
          {tools.map((tool) => {
            return (
              <button
                title={tool.title}
                key={tool.nag}
                className="toolbar-item"
                onClick={() => {
                  addNagsHandler(activeMove, tool.nag);
                }}
              >
                <img
                  height={tool.size ? tool.size : 30}
                  width={tool.size ? tool.size : 30}
                  src={tool.symbol}
                  alt={tool.nag}
                />
              </button>
            );
          })}
          <button
            title="Delete All Variations and Comments"
            className="toolbar-item"
            onClick={() => {
              deleteVarsAndComments();
            }}
          >
            <img
              height={30}
              src={require('../../../public/assets/images/toolbar-symbols/delete-variations-comments.svg')}
              alt="Del"
            />
          </button>
        </div>
        <div>
          <button
            className="upload-cloud-btn"
            variant="primary"
            onClick={uploadPgnCloudHandler}
          >
            <>
              {isLoading ? (
                <div className="circle-loader"></div>
              ) : (
                <AiOutlineCloudUpload className="upload-cloud-icon" />
              )}
            </>
            <span>Save PGN</span>
          </button>
        </div>
      </div>
      {isCommentField && activeMove.move ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addCommentToMove(activeMove, commentText);
            setCommentField(false);
            setCommentText('');
          }}
        >
          <input
            type="text"
            name="commentMv"
            autoFocus
            className="comment-input"
            placeholder="Add a comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="comment-btn comment-btn-apply" type="submit">
            <span className="button-text">Apply</span>
          </button>
          <button
            className="comment-btn comment-btn-close"
            onClick={() => {
              setCommentField(false);
              setCommentText('');
            }}
          >
            <span className="button-text">Close</span>
          </button>
        </form>
      ) : (
        <></>
      )}
      <SavePgnUploadModal
        isOpen={uploadPgnModal}
        setIsOpen={setUploadPgnModal}
        setNewFolderName={setNewFolderName}
        newFolderName={newFolderName}
      />
    </div>
  );
};

export default connect(mapStateToProps, {
  deleteRemainingMoves,
  deleteMoveComment,
  deleteMoveNag,
  deleteVarsAndComments,
  addNags,
  deleteVariation,
  promoteVariation,
  addCommentToMove,
  setUserUploads,
})(Toolbar);
