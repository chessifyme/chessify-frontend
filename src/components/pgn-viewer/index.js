import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { BrowserView, MobileView } from 'react-device-detect';
import DesktopPGNViewer from './DesktopPGNViewer';
import MobilePGNViewer from './MobilePGNViewer';
import SubAnalyzeCheckerModal from './SubAnalyzeCheckerModal';
import {
  checkForUnlimitedPopUp,
  filterUnlimitedServerNames,
} from '../../utils/utils';
import { stopServer } from '../../utils/api';
import UploadsLimitModal from './UploadsLimitModal';
import UploadSizeModal from './UploadSizeModal';
import FreeTrialModal from './FreeTrialModal';
import { setSubModal } from '../../actions/cloud';
import TrialStatusModal from './TrialStatusModal';

const mapStateToProps = (state) => {
  return {
    fen: state.board.fen,
    token: state.cloud.token,
    freeAnalyzer: state.cloud.freeAnalyzer,
    proAnalyzers: state.cloud.proAnalyzers,
    numPV: state.cloud.numPV,
    userFullInfo: state.cloud.userFullInfo,
    uploadLimitExceeded: state.board.uploadLimitExceeded,
    uploadSizeExceeded: state.board.uploadSizeExceeded,
    mType: state.cloud.mType,
    activePgnTab: state.board.activePgnTab,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx,
    switchedTabAnalyzeFen: state.board.switchedTabAnalyzeFen,
    pauseAnalysisUpdate: state.cloud.pauseAnalysisUpdate,
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
    userFullInfo,
    uploadLimitExceeded,
    uploadSizeExceeded,
    mType,
    setSubModal,
    activePgnTab,
    analyzingFenTabIndx,
    switchedTabAnalyzeFen,
    pauseAnalysisUpdate,
  } = props;
  const [fenToAnalyze, setFenToAnalyze] = useState(fen);
  const [unlimitedNamesArr, setUnlimitedNamesArr] = useState(
    filterUnlimitedServerNames(userFullInfo)
  );

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [showTrialStatusModal, setShowTrialStatusModal] = useState(false);

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
    }
  }, [mType]);

  useEffect(() => {
    let names = filterUnlimitedServerNames(userFullInfo);
    if (names.length > unlimitedNamesArr.length) setUnlimitedNamesArr(names);
  }, [Object.keys(userFullInfo.servers).length]);

  const needAnalyzeCheck =
    proAnalyzers &&
    userFullInfo &&
    checkForUnlimitedPopUp(userFullInfo) &&
    userFullInfo.subscription;

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
      return;
    }

    if (!proAnalyzers) {
      const data = {
        command: 'go',
        fen,
        token,
        sub: false,
        numPV: numPV,
      };

      freeAnalyzer.analyzer.emit('analyze', data);
    } else {
      proAnalyzers.forEach((pa) => {
        pa.analyzer.send('stop');
        pa.analyzer.send(`setoption name MultiPV value ${numPV[pa.name]}`);
        pa.analyzer.send(`position fen ${fen}`);
        pa.analyzer.send('go infinite');
      });
    }

    setFenToAnalyze(fen);
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
      userFullInfo.subscription &&
      (parseInt(userFullInfo.subscription.product_id) === 22 ||
        parseInt(userFullInfo.subscription.product_id) === 23);

    for (const [engine, params] of Object.entries(userFullInfo.servers)) {
      if (
        params[0] &&
        (params[0].cores === 32 ||
          (params[0].cores === 100 && isSubscriptionUnlim))
      ) {
        stopServer(engine)
          .then((response) => {
            if (response.error) {
              console.log('ERROR STOPPING');
              return;
            } else {
              console.log('Success stoped');
            }
          })
          .catch((e) => {
            console.error('IN CATCH', e);
          });
      }
    }
  };

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
    </React.Fragment>
  );
};

export default connect(mapStateToProps, {
  setSubModal,
})(PGNViewer);
