import React from 'react';
import { connect } from 'react-redux';
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
import { checkIsBlackMove } from '../../utils/pgn-viewer';

const mapStateToProps = (state) => {
  return {
    activeMove: state.board.activeMove,
  };
};

const MoveContextmenu = (props) => {
  const {
    activeMove,
    deleteVarsAndComments,
    deleteMoveComment,
    deleteMoveNag,
    deleteRemainingMoves,
    addNags,
    promoteVariation,
    deleteVariation,
    setCommentField,
    top,
    left,
    reverse,
  } = props;

  return (
    <div className="move-contextmenu" style={{ left: left, top: top }}>
      <ul>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
            onClick={() => {
              promoteVariation(activeMove);
            }}
          >
            <div>Promote Variation</div>
            <div className='hotkey'>Alt+Up</div>
          </button>
        </li>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
          >
            <div>Delete</div>
            <div>
              <img
                className={reverse ? 'rotated-arrow' : ''}
                height={14}
                src={require('../../../public/assets/images/toolbar-symbols/arrow-extend.svg')}
                style={{ marginLeft: reverse ? 0 : 10 }}
                alt=""
              />
            </div>
          </button>
          <ul
            className={`move-contextmenu  ${
              reverse ? 'move-contextmenu-del-reverse' : ''
            }`}
          >
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  deleteRemainingMoves(activeMove);
                }}
              >
                Delete Remaining Moves
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  deleteVariation(activeMove);
                }}
              >
                Delete Variation
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  deleteMoveComment(activeMove);
                }}
              >
                Delete Move Comments
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  deleteMoveNag(activeMove);
                }}
              >
                Delete Position Values
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  deleteVarsAndComments();
                }}
              >
                Delete Variations and Comments
              </button>
            </li>
          </ul>
        </li>
        <hr className="divider" />
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
            onClick={() => {
              setCommentField(true);
            }}
          >
            <div>Add Comment</div>
            <div className='hotkey'>Ctrl+A</div>
          </button>
        </li>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
          >
            <div>Set Value for Move</div>
            <div
              className={`menu-shortcuts ${reverse ? 'flex-row-reverse' : ''}`}
            >
              <div>{'\u003F '}</div>
              <div>{'\u0021 '}</div>
              <div>
                <img
                  className={reverse ? 'rotated-arrow' : ''}
                  height={14}
                  src={require('../../../public/assets/images/toolbar-symbols/arrow-extend.svg')}
                  style={{ marginLeft: reverse ? 0 : 10 }}
                  alt=""
                />
              </div>
            </div>
          </button>
          <ul
            className={`move-contextmenu move-contextmenu-nags ${
              reverse ? 'move-contextmenu-nags-reverse' : ''
            }`}
          >
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$3');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/very-good-move.svg')}
                  className="gray-tool"
                  alt="Very good move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$1');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/good-move.svg')}
                  className="gray-tool"
                  alt="Good move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$5');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/interesting-move.svg')}
                  className="gray-tool"
                  alt="Interesting move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$6');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/dubious-move.svg')}
                  className="gray-tool"
                  alt="Dubious move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$2');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/bad-move.svg')}
                  className="gray-tool"
                  alt="Bad move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$4');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/very-bad-move.svg')}
                  className="gray-tool"
                  alt="Very bad move"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$7');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/only-move.svg')}
                  className="gray-tool"
                  alt="Only move"
                  width={20}
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(
                    activeMove,
                    checkIsBlackMove(activeMove) ? '$23' : '$22'
                  );
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/zugzwang.svg')}
                  className="gray-tool"
                  alt="Zugzwang"
                />
              </button>
            </li>
          </ul>
        </li>
        <li className="menu-item">
          <button
            type="button"
            className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
          >
            <div>Set Value to Position</div>
            <div
              className={`menu-shortcuts ${reverse ? 'flex-row-reverse' : ''}`}
            >
              <div>{'\u002B\u002D '}</div>
              <div>{'\u003D '}</div>
              <div>
                <img
                  className={reverse ? 'rotated-arrow' : ''}
                  height={14}
                  src={require('../../../public/assets/images/toolbar-symbols/arrow-extend.svg')}
                  style={{ marginLeft: reverse ? 0 : 10 }}
                  alt=""
                />
              </div>
            </div>
          </button>
          <ul
            className={`move-contextmenu move-contextmenu-nags move-contextmenu-nags-game ${
              reverse ? 'move-contextmenu-nags-reverse' : ''
            }`}
          >
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$18');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/white-winning.svg')}
                  className="gray-tool"
                  alt="White winning"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$16');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/white-better.svg')}
                  className="gray-tool"
                  alt="White better"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$14');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/white-slightly-better.svg')}
                  className="gray-tool"
                  alt="White is slightly better"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$11');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/even.svg')}
                  className="gray-tool"
                  alt="Even"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$13');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/unclear.svg')}
                  className="gray-tool"
                  alt="Unclear"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$15');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/black-slightly-better.svg')}
                  className="gray-tool"
                  alt="Black is slightly better"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$17');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/black-better.svg')}
                  className="gray-tool"
                  alt="Black better"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$19');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/black-winning.svg')}
                  className="gray-tool"
                  alt="Black winning"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(activeMove, '$132');
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/counterplay.svg')}
                  className="gray-tool"
                  alt="Counterplay"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(
                    activeMove,
                    checkIsBlackMove(activeMove) ? '$41' : '$40'
                  );
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/attack.svg')}
                  className="gray-tool"
                  alt="With attack"
                />
              </button>
            </li>
            <li className="menu-item">
              <button
                type="button"
                className={`menu-btn ${reverse ? 'flex-row-reverse' : ''}`}
                onClick={() => {
                  addNags(
                    activeMove,
                    checkIsBlackMove(activeMove) ? '$37' : '$36'
                  );
                }}
              >
                <img
                  src={require('../../../public/assets/images/toolbar-symbols/initiative.svg')}
                  className="gray-tool"
                  alt="Initiative"
                />
              </button>
            </li>
          </ul>
        </li>
      </ul>
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
})(MoveContextmenu);
