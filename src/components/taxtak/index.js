import React from 'react';
import { connect } from 'react-redux';
import NewTaxtak from './NewTaxtak';
import PgnViewer from '../pgn-viewer';
import EditArea from './EditArea';
import { setFen, setBoardOrientation, setPgn } from '../../actions/board';
import GameFormatsModal from '../pgn-viewer/GameFormatsModal';
import { LichessEditor } from '../../../public/assets/js/editor.min';
import boardEditordata from '../../utils/board-editor-data';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    orientation: state.board.orientation,
    isEditMode: state.board.isEditMode,
  };
};

const SOUND_MODE_LS_OPTION = 'dashboard:soundMode';

class ChessboardWebgl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      promotion: null,
      editMode: false,
      soundMode: '',
      openGameFormat: false,
      activeTab: 0,
      scannerImg: '',
      displayScannerImg: false,
    };
    this.isDialogOpened = false;
  }

  setSoundMode = (mode) => {
    this.setState({
      soundMode: mode,
    });
  };

  setActiveTab = (tab) => {
    this.setState({
      activeTab: tab,
    });
  };

  setScannerImg = (src) => {
    this.setState({
      scannerImg: src,
    });
  };

  updateSoundMode = (mode) => {
    this.setSoundMode(mode);
    window.localStorage.setItem(SOUND_MODE_LS_OPTION, mode);
  };

  setOpenGameFormat = () => {
    const { openGameFormat } = this.state;
    this.setState({
      openGameFormat: !openGameFormat,
    });
  };

  setDisplayScannerImg = () => {
    const { displayScannerImg } = this.state;
    this.setState({
      displayScannerImg: !displayScannerImg,
    });
  };

  componentDidMount() {
    window.LichessEditor = LichessEditor(
      document.getElementById('board-editor'),
      boardEditordata
    );
    if (window.localStorage.getItem(SOUND_MODE_LS_OPTION) === 'on') {
      this.updateSoundMode('on');
    } else {
      this.updateSoundMode('off');
    }
  }

  render() {
    const {
      fen,
      orientation,
      setFen,
      setBoardOrientation,
      setPgn,
      isEditMode,
    } = this.props;
    const {
      soundMode,
      openGameFormat,
      activeTab,
      scannerImg,
      displayScannerImg,
    } = this.state;

    return (
      <div>
        <main className="page-wrapper">
          <div className="container-fluid">
            <div
              style={{ display: `${isEditMode ? '' : 'none'}` }}
            >
              <div>
                <div
                  className="wood4 d-flex flex-row"
                  style={{
                    '--zoom': 100,
                    padding: '6px',
                  }}
                  data-asset-version="TDotAa"
                  data-asset-url="https://lichess1.org"
                >
                  <div id="board-editor" className="is2d board-area" />
                  {scannerImg.length && displayScannerImg ? (
                    <div className="scanned-img-sec">
                      <div>Scanned Image</div>
                      <img
                        className="scanner-img"
                        src={scannerImg}
                        alt="uploaded image"
                        width={400}
                        height={400}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
            <div className="dashboard-container">
              <div
                className={`board-area  ${
                  !isEditMode ? '' : 'edit-board-area'
                }`}
              >
                <div style={{ display: `${!isEditMode ? '' : 'none'}` }}>
                  <NewTaxtak soundMode={soundMode} />
                </div>
                <div
                  className={`d-flex flex-row mt-2  ${
                    !isEditMode
                      ? ' justify-content-between'
                      : ' justify-content-center'
                  }`}
                >
                  <EditArea
                    fen={fen}
                    orientation={orientation}
                    setFen={setFen}
                    setPgn={setPgn}
                    setBoardOrientation={setBoardOrientation}
                    updateSoundMode={this.updateSoundMode}
                    soundMode={soundMode}
                    setScannerImg={this.setScannerImg}
                    scannerImg={scannerImg}
                    setDisplayScannerImg={this.setDisplayScannerImg}
                  />
                  <div
                    className="game-import-section"
                    style={{ display: `${!isEditMode ? '' : 'none'}` }}
                  >
                    <button
                      className="game-import"
                      type="button"
                      onClick={this.setOpenGameFormat}
                    >
                      <img
                        src={require('../../../public/assets/images/pgn-viewer/import-checkmark.svg')}
                        width="10"
                        height="10"
                        alt=""
                      />
                      Import/ Export
                    </button>
                  </div>
                </div>
                <GameFormatsModal
                  isOpen={openGameFormat}
                  handleModal={this.setOpenGameFormat}
                  setActiveTabPgnViewer={this.setActiveTab}
                  setScannerImg={this.setScannerImg}
                />
              </div>
              <div
                className="pgn-viewer-container-scroll"
                style={{
                  display: `${!isEditMode ? '' : 'none'}`,
                }}
              >
                <PgnViewer
                  activeTab={activeTab}
                  setActiveTab={this.setActiveTab}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default connect(mapStateToProps, {
  setFen,
  setBoardOrientation,
  setPgn,
})(ChessboardWebgl);
