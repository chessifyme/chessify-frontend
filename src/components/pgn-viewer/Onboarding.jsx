import React, { useState, useEffect } from 'react';
import Tour from 'reactour';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { INITIAL_FEN } from '../../constants/board-params';
import {
  addOnboadingData,
  stopServer,
  getUserNotifiactionData,
} from '../../utils/api';
import { connect } from 'react-redux';
import {
  setTourType,
  setTourNextStep,
  setFen,
  setMatchedPositionName,
  deleteFiles,
  removePgnFromArr,
} from '../../actions/board';
import { useNavigate } from 'react-router-dom';

const mapStateToProps = (state) => {
  return {
    notification: state.cloud.notification,
    tourStepNumber: state.board.tourStepNumber,
    userUploads: state.board.userUploads,
    allPgnArr: state.board.allPgnArr,
    userInfo: state.cloud.userInfo,
    serverInfo: state.cloud.serverInfo,
  };
};

const DESCRIPTION = [
  "I'm a tournament player.",
  'I play in chess clubs sometimes.',
  'I only play online.',
  "I'm a beginner.",
];

const Onboarding = ({
  tourStepNumber,
  setTourType,
  setTourNextStep,
  setFen,
  setMatchedPositionName,
  deleteFiles,
  userUploads,
  allPgnArr,
  removePgnFromArr,
  userInfo,
  serverInfo,
}) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [descrChoice, setDescrChoice] = useState(null);
  const navigate = useNavigate();

  const analysisHandler = () => {
    navigate({ pathname: '/analysis' });
    setTourType('analyze');
    setIsTourOpen(false);
    if (allPgnArr.length === 2) {
      removePgnFromArr(allPgnArr.length - 1);
    }
    if (!userUploads.hasOwnProperty('noExistingFilesErrorMessage')) {
      deleteFiles([], Object.keys(userUploads), userInfo).then(() => {});
    }
    if (serverInfo && Object.keys(serverInfo.servers).length === 1) {
      stopServer(Object.keys(serverInfo.servers)[0])
        .then((response) => {
          if (response.error) {
            console.log('ERROR STOPPING');
            return;
          }
        })
        .catch((e) => {
          console.error('IN CATCH', e);
        });
    }
  };

  const steps = [
    {
      selector: '#root',
      content: (
        <div>
          <div class="progress position-relative onboarding-progress">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: `25%` }}
              aria-valuenow={25}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <small class="justify-content-center d-flex position-absolute w-100">
              25%
            </small>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              Create an account
            </p>
          </div>
          <p className="step-desc">What describes you best?</p>
          {DESCRIPTION.map((desc, indx) => {
            return (
              <div key={indx}>
                <button
                  onClick={() => {
                    nextStepHandler();
                    setDescrChoice(indx);
                  }}
                  className={`onboarding-btn ${
                    indx === descrChoice ? 'active-choice' : ''
                  }`}
                >
                  {desc}
                </button>
              </div>
            );
          })}
        </div>
      ),
      position: [25, window.innerHeight - 500],
    },
    {
      selector: '#root',
      content: (
        <div>
          <div class="progress position-relative onboarding-progress">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: `50%` }}
              aria-valuenow={50}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <small class="justify-content-center d-flex position-absolute w-100">
              50%
            </small>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              Create an account
            </p>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              What describes you best?
            </p>
          </div>
          <div>
            <p className="step-desc">What would you like to do now?</p>
          </div>
          <div>
            <button className="onboarding-btn" onClick={analysisHandler}>
              Analyze my game
            </button>
          </div>
          <div>
            <button
              className="onboarding-btn"
              onClick={() => {
                navigate({ pathname: '/analysis' });
                setTourType('study');
                setIsTourOpen(false);
                setFen(INITIAL_FEN);
                setMatchedPositionName(null);
              }}
            >
              Study an opening
            </button>
          </div>
          <div>
            <button
              className="onboarding-btn onboarding-btn-last"
              onClick={() => {
                navigate({ pathname: '/analysis' });
                setTourType('prepare');
                setIsTourOpen(false);
                setFen(INITIAL_FEN);
                setMatchedPositionName(null);
              }}
            >
              Prepare against an opponent
            </button>
          </div>
        </div>
      ),
      position: [25, window.innerHeight - 500],
    },
    {
      selector: '#root',
      content: (
        <div>
          <div class="progress position-relative onboarding-progress">
            <div
              class="progress-bar"
              role="progressbar"
              style={{ width: `100%` }}
              aria-valuenow={100}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
            <small class="justify-content-center d-flex position-absolute w-100">
              100%
            </small>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              Create an account
            </p>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              What describes you best?
            </p>
          </div>
          <div>
            <p className="step-desc prev-step">
              <IoIosCheckmarkCircleOutline />
              What would you like to do now?
            </p>
          </div>
          <div className="d-flex flex-column justify-content-center">
            <p className="step-desc">
              <IoIosCheckmarkCircleOutline />
              You're all set!
            </p>
            <div className="step-desc-expl">
              <p className="text-center">
                Would you like to explore other features?
              </p>
              <div className="d-flex flex-row justify-content-center">
                <button
                  className="apply-btn"
                  onClick={() => {
                    prevStepHandler();
                  }}
                >
                  Yes
                </button>
                <button
                  className="game-format-btn  game-format-close-btn"
                  onClick={() => {
                    closeTour();
                  }}
                >
                  I'm done
                </button>
              </div>
            </div>
          </div>
        </div>
      ),
      position: [25, window.innerHeight - 500],
    },
  ];

  const prevStepHandler = () => {
    setCurrent((prev) => {
      let prevStep = prev > 0 ? prev - 1 : prev;
      return prevStep;
    });
  };

  const nextStepHandler = () => {
    setCurrent((prev) => {
      let nextStep = prev < steps.length - 1 ? prev + 1 : prev;
      return nextStep;
    });
  };

  useEffect(() => {
    getUserNotifiactionData()
      .then((notification) => {
        if (notification) {
          setIsTourOpen(notification.show_onboarding);
        }
      })
      .catch((e) => {
        console.error('USER onBoardingACOOUNT ERROR======>>>>', e);
      });
  }, []);

  useEffect(() => {
    if (tourStepNumber === -1) {
      nextStepHandler();
      setIsTourOpen(true);
    }
  }, [tourStepNumber]);

  const closeTour = () => {
    setTourNextStep(0);
    setTourType('');
    setIsTourOpen(false);
    addOnboadingData(descrChoice ? DESCRIPTION[descrChoice] : '');
  };

  return (
    <>
      <Tour
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={closeTour}
        accentColor={'#358c65'}
        className="reactour-popup"
        prevStep={prevStepHandler}
        nextStep={nextStepHandler}
        goToStep={current}
        disableFocusLock={true}
        closeWithMask={false}
        startAt={current}
      />
    </>
  );
};

export default connect(mapStateToProps, {
  setTourType,
  setTourNextStep,
  setFen,
  setMatchedPositionName,
  setTourType,
  setTourNextStep,
  deleteFiles,
  removePgnFromArr,
})(Onboarding);
