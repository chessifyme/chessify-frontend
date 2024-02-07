import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { BrowserView, MobileView } from 'react-device-detect';
import { useSearchParams } from 'react-router-dom';
import DesktopPGNViewer from './DesktopPGNViewer';
import MobilePGNViewer from './MobilePGNViewer';
import SubAnalyzeCheckerModal from './SubAnalyzeCheckerModal';
import {
  checkForUnlimitedPopUp,
  filterUnlimitedServerNames,
} from '../../utils/utils';
import { stopServer} from '../../utils/api';
import UploadsLimitModal from './UploadsLimitModal';
import UploadSizeModal from './UploadSizeModal';
import FreeTrialModal from './FreeTrialModal';
import { setSubModal , setSavedAnalyzeInfo, getUserServersInfo} from '../../actions/cloud';
import {
  setActiveMove,
  setActivePgnTab,
  setSwitchedTabAnalyzingFen,
} from '../../actions/board';
import TrialStatusModal from './TrialStatusModal';
import { modifyAllPgnArr } from '../../utils/pgn-viewer';
import SurvayModal from './SurvayModal';
import CurrentlyAnalyzingModal from './CurrentlyAnalyzingModal'

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    token: state.cloud.token,
    freeAnalyzer: state.cloud.freeAnalyzer,
    proAnalyzers: state.cloud.proAnalyzers,
    numPV: state.cloud.numPV,
    serverInfo: state.cloud.serverInfo,
    uploadLimitExceeded: state.board.uploadLimitExceeded,
    uploadSizeExceeded: state.board.uploadSizeExceeded,
    mType: state.cloud.mType,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    switchedTabAnalyzeFen: state.board.switchedTabAnalyzeFen,
    pauseAnalysisUpdate: state.cloud.pauseAnalysisUpdate,
    isColorSwitched: state.cloud.isColorSwitched,
    activeMove: state.board.activeMove,
    allPgnArr: state.board.allPgnArr,
    plans: state.cloud.plans,
  };
};

const PGNViewer = (props) => {
  const {
    fen,
    token,
    freeAnalyzer,
    proAnalyzers,
    numPV,
    activeTab,
    setActiveTab,
    serverInfo,
    uploadLimitExceeded,
    uploadSizeExceeded,
    mType,
    setSubModal,
    activePgnTab,
    analyzingFenTabIndx,
    switchedTabAnalyzeFen,
    pauseAnalysisUpdate,
    setScannerImg,
    isColorSwitched,
    activeMove,
    allPgnArr,
    setActiveMove,
    setActivePgnTab,
    setSwitchedTabAnalyzingFen,
    plans,
    setLoginModal,
    setSavedAnalyzeInfo,
    getUserServersInfo,
  } = props;
  const [fenToAnalyze, setFenToAnalyze] = useState(fen);
  const [unlimitedNamesArr, setUnlimitedNamesArr] = useState(
    filterUnlimitedServerNames(serverInfo, plans)
  );

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showTrialStatusModal, setShowTrialStatusModal] = useState(false);
  const [showSurvayStatusModal, setShowSurvayStatusModal] = useState(false);
  const [currentlyAnalyzingModal, setCurrentlyAnalyzingModal] = useState(false);
  const [bringServersSocketData, setBringServersSocketData] = useState(null)
  const [isFocus, setIsFocus] = useState(false)
  const [initFreeAnalysis, setInitFreeAnalysis] = useState(false);

  useEffect(() => {
    const url_string = window.location.href;
    const url = new URL(url_string);
    const trialStatusFromUrl = url.searchParams.get('redirect');
    if (trialStatusFromUrl === 'amateur-trial-demo' && !showTrialStatusModal) {
      setShowTrialStatusModal(true);
    }
  });

  useEffect(() => {
    setShowLimitModal(uploadLimitExceeded);
  }, [uploadLimitExceeded]);

  useEffect(() => {
    setShowSizeModal(uploadSizeExceeded);
  }, [uploadSizeExceeded]);

  useEffect(() => {
    if (mType === 'trial') {
      setShowTrialModal(true);
    } else if (mType === 'after5Min' || mType === 'reference') {
      setShowLimitModal(true);
    } else if (mType === 'survey') {
      setShowSurvayStatusModal(true);
    }else if(mType === 'currently_analyzing'){
      setCurrentlyAnalyzingModal(true)
    }

  }, [mType]);

  useEffect(() => {
    let names = filterUnlimitedServerNames(serverInfo, plans);
    if (names.length > unlimitedNamesArr.length) setUnlimitedNamesArr(names);
  }, [
    serverInfo && serverInfo.servers
      ? Object.keys(serverInfo.servers).length
      : null,
  ]);

  useEffect(() => {
    window.onbeforeunload = function () {
      sessionStorage.removeItem('chessify_next_games');
      setActiveMove(activeMove);
      setActivePgnTab(activePgnTab);
      modifyAllPgnArr(allPgnArr);
      window.sessionStorage.setItem(
        'chessify_active_notation_tab',
        activePgnTab
      );
      window.sessionStorage.setItem(
        'chessify_analysis_notation_tab',
        analyzingFenTabIndx
      );
      window.sessionStorage.setItem(
        'chessify_notation_tab_arr',
        JSON.stringify(allPgnArr)
      );
      
      return;
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [activePgnTab, analyzingFenTabIndx, allPgnArr, activeMove]);

  const needAnalyzeCheck =
    proAnalyzers &&
    serverInfo &&
    checkForUnlimitedPopUp(serverInfo, plans) &&
    plans &&
    plans.subscription;

  ////
  // ANALYZING POSITION
  ////
  const handleAnalyze = (newTab = null) => {
    const noAnalyzers = !freeAnalyzer && !proAnalyzers;
    const backToActiveAnalyzeTab =
      activePgnTab === analyzingFenTabIndx && switchedTabAnalyzeFen === fen;

    let newActiveTab = newTab !== null ? newTab : activePgnTab;

    const updatedAnalyzeTabIndx =
      analyzingFenTabIndx !== newActiveTab && analyzingFenTabIndx !== null;

    if (
      noAnalyzers ||
      backToActiveAnalyzeTab ||
      updatedAnalyzeTabIndx ||
      pauseAnalysisUpdate
    ) {
      if (backToActiveAnalyzeTab) setSwitchedTabAnalyzingFen('');
      return;
    }

    let newFen = fen;

    if (isColorSwitched) {
      newFen = fen.includes(' w ')
        ? fen.replace(' w ', ' b ')
        : fen.replace(' b ', ' w ');
    }

    if (!proAnalyzers) {
      const data = {
        command: 'go',
        fen,
        token,
        PV: 3,
      };
      freeAnalyzer.analyzer.emit('analyze', data);
    } else {
      proAnalyzers.forEach((pa) => {
        pa.analyzer.send('stop');
        pa.analyzer.send(`setoption name MultiPV value ${numPV[pa.name]}`);
        pa.analyzer.send(`position fen ${newFen}`);
        pa.analyzer.send('go infinite');
      });
    }

    setFenToAnalyze(newFen);
  };

  ////
  // STOP ANALYZE
  ////
  const handleStopAnalyze = () => {
    if (!freeAnalyzer && !proAnalyzers) return;

    if (analyzingFenTabIndx !== activePgnTab && analyzingFenTabIndx !== null) {
      return;
    }

    if (!proAnalyzers) {
      const data = {
        command: 'stop',
        fen,
        token,
        sub: false,
        numPV: numPV,
      };

      freeAnalyzer.analyzer.emit('analyze', data);
    } else {
      proAnalyzers.forEach((pa) => {
        pa.analyzer.send('stop');
      });
    }
  };
  const handleStopServer = () => {
    if (!proAnalyzers) return;
    const isSubscriptionUnlim =
      plans &&
      plans.subscription &&
      (parseInt(plans.subscription.product_id) === 22 ||
        parseInt(plans.subscription.product_id) === 23 ||
        parseInt(plans.subscription.product_id) === 25);

    for (const [engine, params] of Object.entries(serverInfo.servers)) {
      if (
        params[0] &&
        (params[0].cores === 32 ||
          params[0].cores === 16 ||
          (params[0].cores === 100 && isSubscriptionUnlim))
      ) {
        stopServer(engine)
          .then((response) => {
            if (response.error) {
              if(response.servers)
              getUserServersInfo({servers:response.servers})
              console.log('ERROR STOPPING');
              return;
            } else {
              getUserServersInfo({servers:response.servers})
              console.log('Success stoped');
            }
          })
          .catch((e) => {
            console.error('IN CATCH', e);
          });
      }
    }
  };

  useEffect(() => {
    if (freeAnalyzer && !initFreeAnalysis) {
      handleAnalyze();
      setInitFreeAnalysis(true);
    }
  }, [freeAnalyzer]);

  useEffect(() => {
    const savedAnalyzeInfoFromSessionStorage = JSON.parse(
      sessionStorage.getItem('latest_analyze_info')
    );
    if (savedAnalyzeInfoFromSessionStorage) {
      setSavedAnalyzeInfo(savedAnalyzeInfoFromSessionStorage);
    }    
  }, [serverInfo]);

  return (
    <React.Fragment>
      <BrowserView>
        <DesktopPGNViewer
          fenToAnalyze={fenToAnalyze}
          setFenToAnalyze={setFenToAnalyze}
          handleAnalyze={handleAnalyze}
          handleStopAnalyze={handleStopAnalyze}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setScannerImg={setScannerImg}
          setBringServersSocketData = {setBringServersSocketData}
          setCurrentlyAnalyzingModal = {setCurrentlyAnalyzingModal}
          isFocus = {isFocus}
          setIsFocus = {setIsFocus}
          setLoginModal={setLoginModal}
        />
      </BrowserView>
      <MobileView>
        <MobilePGNViewer
          fenToAnalyze={fenToAnalyze}
          setFenToAnalyze={setFenToAnalyze}
          handleAnalyze={handleAnalyze}
          handleStopAnalyze={handleStopAnalyze}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setScannerImg={setScannerImg}
          setBringServersSocketData = {setBringServersSocketData}
          setCurrentlyAnalyzingModal = {setCurrentlyAnalyzingModal}
          isFocus = {isFocus}
          setIsFocus = {setIsFocus}
          setLoginModal={setLoginModal}
        />
      </MobileView>
      {needAnalyzeCheck && (
        <SubAnalyzeCheckerModal
          stop={handleStopServer}
          proAnalyzers={proAnalyzers}
          unlimitedNamesArr={unlimitedNamesArr}
        />
      )}
      <UploadsLimitModal
        showModal={showLimitModal}
        setShowModal={setShowLimitModal}
        limitType={showLimitModal && mType.length ? mType : 'cloudUpload'}
      />
      <UploadSizeModal
        showModal={showSizeModal}
        setShowModal={setShowSizeModal}
      />
      <FreeTrialModal
        showModal={showTrialModal}
        setShowModal={setShowTrialModal}
        setSubModal={setSubModal}
      />
      <TrialStatusModal
        showModal={showTrialStatusModal}
        setShowModal={setShowTrialStatusModal}
      />
      <SurvayModal
        showModal={showSurvayStatusModal}
        setShowModal={setShowSurvayStatusModal}
        setSubModal={setSubModal}
      />
     {bringServersSocketData && <CurrentlyAnalyzingModal
        showModal={currentlyAnalyzingModal}
        setShowModal={setCurrentlyAnalyzingModal}
        setSubModal={setSubModal}
        bringServersSocketData = {bringServersSocketData}
        setIsFocus = {setIsFocus}
        activePgnTab = {activePgnTab}
      />
     }
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  setSubModal,
  setActiveMove,
  setActivePgnTab,
  setSwitchedTabAnalyzingFen,
  setSavedAnalyzeInfo,
  getUserServersInfo
})(PGNViewer);
