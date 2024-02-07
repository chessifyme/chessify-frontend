import React, { useState, useEffect } from 'react';
import Tour from 'reactour';
import { connect } from 'react-redux';
import {
  setTourNextStep,
  setTourNumber,
  setTourType,
  setCurrentDirectory,
  deleteFiles,
  removePgnFromArr,

} from '../../actions/board';
import { downloadPGN } from '../../utils/chess-utils';

const mapStateToProps = (state) => {
  return {
    tourType: state.board.tourType,
    tourStepNumber: state.board.tourStepNumber,
    userInfo: state.cloud.userInfo,
    userUploads: state.board.userUploads,
    allPgnArr: state.board.allPgnArr,

  };
};

const OnboardingTutorial = ({
  tourType,
  tourStepNumber,
  setTourNextStep,
  setTourNumber,
  setTourType,
  setCurrentDirectory,
  userInfo,
  deleteFiles,
  userUploads,
  removePgnFromArr,
  allPgnArr,
  
}) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [steps, setSteps] = useState([]);

  const downloadSamplePgn = () => {
    const pgn =
      '[Event "Hoogovens Group A"]\n[Site "Wijk aan Zee NED"]\n[Date "1999.01.20"]\n[EventDate "1999.01.16"]\n[Round "4"]\n[Result "1-0"]\n[White "Garry Kasparov"]\n[Black "Veselin Topalov"]\n[ECO "B07"]\n[WhiteElo "2812"]\n[BlackElo "2700"]\n[PlyCount "87"]\n\n1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5\n7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7\n12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6\n17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4\n22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6\n26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7\nQc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2\n35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8\nRd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0';
    downloadPGN(pgn);
  };

  const boardingSteps = {
    analyze: [
      {
        selector: '#uploadsTab',
        content: 'Go to Uploads to add your game',
        position: 'left',
      },
      {
        selector: '#createFolder',
        content: 'Create a folder',
        position: 'left',
      },
      {
        selector: '#folderInputName',
        content: 'Give it a name and click create',
        position: 'right',
      },
      {
        selector: '#folderContainer',
        content: 'Double-click to open the folder',
        position: 'left',
      },
      {
        selector: '#uploadFile',
        content: (
          <>
            <div>Upload your game file</div>
            <div className="tour-download">
              Don't have a file at the moment? Download{' '}
              <button className="sample-pgn" onClick={downloadSamplePgn}>
                a sample PGN{' '}
              </button>{' '}
              and then upload it to continue.
            </div>
          </>
        ),
        position: 'left',
      },
      {
        selector: '#uploadedFile',
        content: 'Double-click to open the file',
        position: 'left',
      },
      {
        selector: '#analyzeStockfishBtn',
        content: 'Click here to start the engine',
        position: 'left',
        observe: '#analysisAreaEngines',
      },
    ],
    study: [
      {
        selector: '#referenceTab',
        content: 'Click here to see the opening moves',
        position: 'right',
      },
      {
        selector: '#moveReference',
        content: 'Click on the move you want to study',
        position: 'left',
      },
      {
        selector: '#gameReference',
        content: 'You can view any game by clicking on it',
        position: 'left',
      },
    ],
    prepare: [
      {
        selector: '#referenceTab',
        content: 'Go to the reference section',
        position: 'right',
      },
      {
        selector: '#quickSearchInput',
        content: "Type the player's name and choose from the options",
        position: 'left',
        observe: '#quickSearch',
      },
      {
        selector: '#advancedSearch',
        content: 'Click here to add more search details',
        position: 'left',
      },
      {
        selector: '#ignoreColor',
        content: 'Uncheck this box to prepare against a specific color',
        position: 'left',
      },
      {
        selector: '#ignoreBlitzRapid',
        content: 'Check this box to remove blitz and repid games',
        position: 'left',
      },
      {
        selector: '#searchFilterBtn',
        content: 'Click “Search” after you add the needed details',
        position: 'left',
      },
    ],
  };

  useEffect(() => {
    if (tourType.length) {
      setSteps(boardingSteps[tourType]);
      setIsTourOpen(true);
    } else {
      closeTour();
    }
  }, [tourType]);

  useEffect(() => {
  }, [tourStepNumber]);

  const closeTour = () => {
    setIsTourOpen(false);
    if (tourType.length) {
      if(tourType === 'analyze'){
        setCurrentDirectory('/');
        if (tourStepNumber > 2) {
          if(allPgnArr.length === 2){
            removePgnFromArr(allPgnArr.length-1);
          }
          deleteFiles( [], Object.keys(userUploads), userInfo).then(() => {
          })
        
        
        }
      }
      setTourNumber(-1);
      setTourType('');
    }
  };
  return (
    <Tour
      steps={steps}
      isOpen={isTourOpen}
      onRequestClose={closeTour}
      accentColor={'#358c65'}
      className="reactour-tutorial"
      nextStep={setTourNextStep}
      goToStep={tourStepNumber === -1 ? 0 : tourStepNumber}
      disableFocusLock={true}
      disableKeyboardNavigation={true}
      disableDotsNavigation={true}
      rounded={8}
      showButtons={false}
      closeWithMask={false}
      scrollSmooth={true}
      inViewThreshold={0}
      startAt={0}
    />
  );
};

export default connect(mapStateToProps, {
  setTourNextStep,
  setTourNumber,
  setTourType,
  setCurrentDirectory,
  deleteFiles,
  removePgnFromArr
})(OnboardingTutorial);
