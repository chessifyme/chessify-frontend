import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import {
  GUEST_USER_AVAILABLE_SERVERS,
  GUEST_USER_ENGINES_OPTION,
} from '../../constants/cloud-params';
import CustomDropDown from '../common/CustomDropDown';
import SavedAnalysisArea from './SavedAnalysisArea';
import {
  setSavedAnalyzeInfo,
  connectToFree,
  setSubModal
} from '../../actions/cloud';
import {
  getEnginesListFromAvailableServers,
  showAnalyzeButton,
  ENGINES_NAMES,
} from '../../utils/engine-list-utils';
import {
  getAvailableServers,
  getEnginesOptions,
  orderServer,
} from '../../utils/api';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import Accordion from 'react-bootstrap/Accordion';
import { setAnalyzingFenTabIndx } from '../../actions/board';
import StopAnalysisModal from './StopAnalysisModal';
import CoinsCardModal from './CoinsCardModal';
import { captureException } from '@sentry/react';

const mapStateToProps = (state) => {
  return {
    freeAnalyzer: state.cloud.freeAnalyzer,
    proAnalyzers: state.cloud.proAnalyzers,
    plans: state.cloud.plans,
    serverInfo: state.cloud.serverInfo,
    savedAnalyzeInfo: state.cloud.savedAnalyzeInfo,
    activePgnTab: state.board.activePgnTab,
    initiateFullAnalysis: state.cloud.initiateFullAnalysis,
    mType: state.cloud.mType,
    analyzingFenTabIndx: state.board.analyzingFenTabIndx
  };
};

const loadingOrderedServer = () => {
  return (
    <div className="lds-ellipsis">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

const DisplayEngineOption = ({
  engineName,
  enginesOptionsList,
  handleOptionChange,
  engineNameStyleClassName,
  needOption,
  isGuestUser,
  setLoginModal,
}) => {
  const [cpuctValue, setCpuctValue] = useState();
  const [contemptValue, setContemptValue] = useState();
  const engineOptions = enginesOptionsList[engineName];
  const optionLabels = engineOptions ? Object.keys(engineOptions) : [];

  const hnadleCpuctChnage = (e, option, engineName, type) => {
    if (e.target.value < 0 || e.target.value > 100) {
      return;
    }
    handleEngineOptionChnage(e.target, option, engineName, type);
    setCpuctValue(e.target.value);
  };
  const hnadleContemptChnage = (e, option, engineName, type) => {
    if (e.target.value < 0 || e.target.value > 100) {
      return;
    }
    handleEngineOptionChnage(e.target, option, engineName, type);
    setContemptValue(e.target.value);
  };
  const decrementCpuctValue = (option, engineName, type) => {
    const inputNumber = document.getElementById('cpuct');
    inputNumber.stepDown(1);
    const val = document.getElementById('cpuct').value;
    setCpuctValue(val);
    handleEngineOptionChnage({ value: val }, option, engineName, type);
  };

  const incrementCpuctValue = (option, engineName, type) => {
    const inputNumber = document.getElementById('cpuct');
    inputNumber.stepUp(1);
    const val = document.getElementById('cpuct').value;
    setCpuctValue(val);
    handleEngineOptionChnage({ value: val }, option, engineName, type);
  };

  const decrementContemptnValue = (option, engineName, type) => {
    const inputNumber = document.getElementById('contempt');
    inputNumber.stepDown(1);
    const val = document.getElementById('contempt').value;
    setContemptValue(val);
    handleEngineOptionChnage({ value: val }, option, engineName, type);
  };

  const incrementContempValue = (option, engineName, type) => {
    const inputNumber = document.getElementById('contempt');
    inputNumber.stepUp(1);
    const val = document.getElementById('contempt').value;
    setContemptValue(val);
    handleEngineOptionChnage({ value: val }, option, engineName, type);
  };

  const handleEngineOptionChnage = (event, option, engine, type) => {
    const { value } = event;
    if (type === 'option') {
      enginesOptionsList[engine][option].options.sort(function (x, y) {
        return x === value ? -1 : y === value ? 1 : 0;
      });
    } else if (type === 'number') {
      const num = typeof value === 'number' ? parseFloat(value) : value;
      const { valid_range } = enginesOptionsList[engine][option];
      if (!num || (valid_range[0] <= num && num <= valid_range[1])) {
        enginesOptionsList[engine][option].options[0] = num;
      }
    } else if (type === 'boolean') {
      const checked = event.target.checked;
      enginesOptionsList[engine][option].options[0] = checked;
    }
    handleOptionChange(enginesOptionsList);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: 'max-content',
        flexDirection: 'row-reverse',
      }}
    >
      {optionLabels.map((option, index) => {
        return needOption !== 'boolean' ? (
          <>
            {engineOptions[option].type === 'option' && (
              <>
                <CustomDropDown
                  option={option}
                  engineName={engineName}
                  type={engineOptions[option].type}
                  items={engineOptions[option].options}
                  handleEngineOptionChnage={handleEngineOptionChnage}
                  engineNameStyleClassName={engineNameStyleClassName}
                  setLoginModal={setLoginModal}
                  isGuestUser={isGuestUser}
                />
              </>
            )}

            {engineOptions[option].type === 'number' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                className="d-flex align-items-center"
              >
                <label
                  style={{ margin: 0 }}
                  htmlFor={
                    engineOptions[option].description.includes('Contempt')
                      ? 'contempt'
                      : 'cpuct'
                  }
                >
                  {option}:{' '}
                </label>
                <input
                  id={
                    engineOptions[option].description.includes('Contempt')
                      ? 'contempt'
                      : 'cpuct'
                  }
                  min={engineOptions[option].valid_range[0]}
                  max={engineOptions[option].valid_range[1]}
                  step="0.1"
                  type="number"
                  value={
                    engineOptions[option].description.includes('Contempt')
                      ? contemptValue || engineOptions[option].options[0]
                      : cpuctValue || engineOptions[option].options[0]
                  }
                  onChange={(e) => {
                    engineOptions[option].description.includes('Contempt')
                      ? hnadleContemptChnage(
                        e,
                        option,
                        engineName,
                        engineOptions[option].type
                      )
                      : hnadleCpuctChnage(
                        e,
                        option,
                        engineName,
                        engineOptions[option].type
                      );
                  }}
                  className="option-number-input"
                />
                <div className="d-flex mr-2">
                  <button
                    className="number-option-button"
                    onClick={() => {
                      engineOptions[option].description.includes('Contempt')
                        ? decrementContemptnValue(
                          option,
                          engineName,
                          engineOptions[option].type
                        )
                        : decrementCpuctValue(
                          option,
                          engineName,
                          engineOptions[option].type
                        );
                    }}
                  >
                    <IoIosArrowBack />
                  </button>
                  <button
                    className="number-option-button"
                    onClick={() => {
                      engineOptions[option].description.includes('Contempt')
                        ? incrementContempValue(
                          option,
                          engineName,
                          engineOptions[option].type
                        )
                        : incrementCpuctValue(
                          option,
                          engineName,
                          engineOptions[option].type
                        );
                    }}
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              width: 'max-content',
              alignItems: 'center',
            }}
          >
            {engineOptions[option].type === 'boolean' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <label
                  style={{
                    margin: 0,
                    verticalAlign: 'unset',
                  }}
                  htmlFor="syzygy"
                >
                  {option}:{' '}
                </label>
                <input
                  onClick={(e) => {
                    handleEngineOptionChnage(
                      e,
                      option,
                      engineName,
                      engineOptions[option].type
                    );
                  }}
                  type="checkbox"
                  value={engineOptions[option].options[0]}
                  defaultChecked={engineOptions[option].options[0]}
                  className="syzygy-checkbox-input"
                />
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
};

const MobileEnginesList = (props) => {
  const {
    plans,
    serverInfo,
    savedAnalyzeInfo,
    setSavedAnalyzeInfo,
    setAnalyzingFenTabIndx,
    activePgnTab,
    initiateFullAnalysis,
    enginesOptionsList,
    setEnginesOptionsList,
    availableServers,
    setAvailableServers,
    setSubModal,
    mType,
    isGuestUser,
    setLoginModal,
    analysisLoader,
    setAnalysisLoader,
    analysisStopLoader,
    freeAnalyzer,
    connectToFree,
    analyzingFenTabIndx,
  } = props;
  const enginesEndRef = useRef(null);
  const [isServerOrdering, setIsServerOrdering] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const [coreIndex, setCoreIndex] = useState({
    asmfish: 0,
    stockfish10: 0,
    sugar: 0,
    lc0: 0,
    berserk: 0,
    koivisto: 0,
    rubichess: 0,
    shashchess: 0,
    komodo: 0,
  });
  const [openStopAnalysisModal, setOpenAnalysisModal] = useState(false);
  const [openCoinsModal, setOpenCoinsModal] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    }

    _getEnginesOptions();
  }, [isExpanded]);

  const servers = serverInfo ? serverInfo.servers : null;
  const scrollToBottom = () => {
    enginesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const enginesStockfishLc0 = Object.keys(
    getEnginesListFromAvailableServers(availableServers, plans, isGuestUser)
  ).filter(
    (serverName) => serverName === 'lc0' || serverName === 'stockfish10'
  );

  const restEngineList = Object.keys(
    getEnginesListFromAvailableServers(availableServers, plans, isGuestUser)
  ).filter(
    (serverName) => serverName !== 'lc0' && serverName !== 'stockfish10'
  );
  const engineList = [
    getEnginesListFromAvailableServers(availableServers, plans, isGuestUser),
  ];

  const _getEnginesOptions = () => {
    if (isGuestUser) {
      setEnginesOptionsList(GUEST_USER_ENGINES_OPTION);
      return;
    }
    getEnginesOptions()
      .then((enginesOptionsList) => {
        setEnginesOptionsList(enginesOptionsList);
      })
      .catch((e) => {
        console.error(e);
      });
  };
  const handelCoreChange = (indexValue, name) => {
    if (!analysisLoader) {
      const newObj = { ...coreIndex };
      newObj[name] = indexValue;
      setCoreIndex(newObj);
    }
  };

  const handleOrderServer = (item, serverName) => {
    setAnalysisLoader(true);
    if (item == undefined) {
      delete isServerOrdering[serverName];
      setIsServerOrdering(isServerOrdering);
      console.log('ERROR ORDERING');
      return;
    }
    const { cores } = item;
    setAnalyzingFenTabIndx(activePgnTab);
    const options = enginesOptionsList[serverName];
    if (servers && Object.keys(servers).length >= 1) {
      const newObj = { ...coreIndex };
      for (let [key, value] of Object.entries(newObj)) {
        if (key != 'stockfish10' && key !== 'lcO' && value == 1) {
          newObj[key] = 0;
        }
        if (
          key == 'stockfish10' &&
          (value == 4 ||
            engineList[0][serverName].findIndex(
              (items) => items.cores == 16
            ) !== -1)
        ) {
          newObj[key] = 0;
        }
      }

      setCoreIndex(newObj);
    }
    isServerOrdering[serverName] = true;
    setIsServerOrdering(isServerOrdering);
    if (isGuestUser) {
      connectToFree();
      setAnalysisLoader(false);
      return;
    }
    orderServer(cores, serverName, options)
      .then((response) => {
        if (response.error) {
          delete isServerOrdering[serverName];
          setIsServerOrdering(isServerOrdering);
          console.log('ERROR ORDERING');
          return;
        }
        _getEnginesOptions();
        delete isServerOrdering[serverName];
        setIsServerOrdering(isServerOrdering);
        setAnalysisLoader(false);
      })
      .catch((e) => {
        delete isServerOrdering[serverName];
        setIsServerOrdering(isServerOrdering);
        setAnalysisLoader(false);
        console.log('IN CATCH', e);
      });
  };

  const handleOptionChange = (optionsList) => {
    setEnginesOptionsList(optionsList);
  };

  useEffect(() => {
    if (isGuestUser) {
      setAvailableServers(GUEST_USER_AVAILABLE_SERVERS);
      return;
    }
    getAvailableServers()
      .then((serversList) => {
        setAvailableServers(serversList);
      })
      .catch((e) => {
        captureException(e);
        console.error('_getAvailableServers-err', e);
      });
  }, []);

  return (
    <>
      {enginesStockfishLc0.map((name, index) => {
        if (
          ENGINES_NAMES[name].includes('Stockfish') &&
          isGuestUser &&
          freeAnalyzer
        )
          return;
        return (
          <div
            className="main-container-wrapper"
            key={index}
            style={{
              display:
                servers &&
                servers.constructor === Object &&
                servers[name] &&
                !initiateFullAnalysis
                  ? 'none'
                  : '',
            }}
          >
            {engineList.map((engine, index) => {
              return (
                <div key={index}>
                  <div className="mb-engines-list-info mb-2">
                    <div className="analyze-info-item">
                      {name === 'stockfish10' ? (
                        <DisplayEngineOption
                          engineName={name}
                          engineNameStyleClassName={'engine-name-wrapper'}
                          enginesOptionsList={enginesOptionsList}
                          handleOptionChange={handleOptionChange}
                          setLoginModal={setLoginModal}
                          isGuestUser={isGuestUser}
                        />
                      ) : (
                        <h6 className="engine-name-wrapper">
                          {ENGINES_NAMES[name]}
                        </h6>
                      )}
                    </div>
                    {name !== 'stockfish10' && (
                      <div className="mb-analyze-info-item-wrapper lso">
                        <DisplayEngineOption
                          engineName={name}
                          enginesOptionsList={enginesOptionsList}
                          handleOptionChange={handleOptionChange}
                          setLoginModal={setLoginModal}
                          isGuestUser={isGuestUser}
                        />
                      </div>
                    )}
                    {name !== 'lc0' && (
                      <div className="analyze-info-core-item-wraper">
                        <span style={{ margin: 'auto 0px' }}>
                          Server:&nbsp;
                        </span>
                        <CustomDropDown
                          coreIndex={coreIndex}
                          type={'cores'}
                          items={engine[name]}
                          engineName={name}
                          plans={plans}
                          handelCoreChange={handelCoreChange}
                          openCoinsModal={openCoinsModal}
                          setOpenCoinsModal={setOpenCoinsModal}
                          setLoginModal={setLoginModal}
                          isGuestUser={isGuestUser}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mb-engines-list-info-bottom mb-2">
                    <div>
                      <DisplayEngineOption
                        engineName={name}
                        enginesOptionsList={enginesOptionsList}
                        handleOptionChange={handleOptionChange}
                        needOption="boolean"
                        setLoginModal={setLoginModal}
                        isGuestUser={isGuestUser}
                      />
                    </div>
                    <div className="analyze-button-wrapper">
                      {isServerOrdering[name] && loadingOrderedServer()}
                      {((servers &&
                        (!servers[name] || initiateFullAnalysis) &&
                        !isServerOrdering[name] &&
                        showAnalyzeButton(
                          plans,
                          engineList[0][name][coreIndex[name]],
                          (
                            engineList[0][name][coreIndex[name]] ||
                            engineList[0][name][0]
                          ).price_per_minute
                        )) ||
                        (isGuestUser &&
                          ENGINES_NAMES[name].includes('Stockfish'))) &&
                        (!initiateFullAnalysis ? (
                          <button
                            className={
                              !analysisLoader
                                ? 'analyze-button'
                                : 'analyze-button-loader'
                            }
                            disabled={analysisLoader || analysisStopLoader}
                            onClick={() => {
                              if (!Boolean(sessionStorage.getItem('tabs')) && Object.keys(servers).length) {
                                setSubModal('currently_analyzing')
                              } else {
                                sessionStorage.setItem('tabs', true)
                                handleOrderServer(
                                  engineList[0][name][coreIndex[name]],
                                  name
                                )
                              }
                            }}
                          >
                            Analyze
                          </button>
                        ) : (
                          <button
                            id={`${ENGINES_NAMES[name].includes('Stockfish')
                              ? 'analyzeStockfishBtn'
                              : ''
                              }`}
                            className={
                              !analysisLoader
                                ? 'analyze-button'
                                : 'analyze-button-loader'
                            }
                            disabled={analysisLoader || analysisStopLoader}
                            onClick={() => {
                              setOpenAnalysisModal(true);
                            }}
                          >
                            Analyze
                          </button>
                        ))}
                      {((servers &&
                        !servers[name] &&
                        !isServerOrdering[name] &&
                        !showAnalyzeButton(
                          plans,
                          engineList[0][name][coreIndex[name]],
                          (
                            engineList[0][name][coreIndex[name]] ||
                            engineList[0][name][0]
                          ).price_per_minute
                        )) ||
                        (isGuestUser &&
                          !ENGINES_NAMES[name].includes('Stockfish'))) && (
                        <button
                          className="analyze-button-disabled"
                          onClick={() => {
                            if (isGuestUser) {
                              setLoginModal(true);
                              return;
                            }
                            setOpenCoinsModal(true);
                          }}
                        >
                          Analyze
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {savedAnalyzeInfo &&
              savedAnalyzeInfo.map((info, index) => {
                if (info.name === name && info.analysis) {
                  console.log('INFO NAME ' + info.name + ' name ' + name);
                  return <SavedAnalysisArea key={index} serverName={name} />;
                }
                return null;
              })}
          </div>
        );
      })}
      <Accordion>
        <Accordion.Item eventKey="0" className="accordion-item">
          <Accordion.Button
            className="accordion-button accord-btn-mb mt-2"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            More Engines
            {!isExpanded &&
              restEngineList.map((serverName, index) => (
                <span key={index}>
                  &nbsp;&nbsp;{ENGINES_NAMES[serverName]}&nbsp;&nbsp;
                </span>
              ))}
          </Accordion.Button>
          {restEngineList.map((name, index) => (
            <Accordion.Body
              className="accordion-body"
              key={index}
              style={{
                display:
                  servers &&
                  servers.constructor === Object &&
                  servers[name] &&
                  !initiateFullAnalysis
                    ? 'none'
                    : '',
              }}
            >
              <div className="main-container-wrapper">
                <div>
                  {engineList.map((engine, index) => {
                    return (
                      <div key={index}>
                        <div className="mb-engines-list-info mb-2">
                          {enginesOptionsList[name] &&
                            enginesOptionsList[name].engine ? (
                            <DisplayEngineOption
                              engineName={name}
                              engineNameStyleClassName={'engine-name-wrapper'}
                              enginesOptionsList={enginesOptionsList}
                              handleOptionChange={handleOptionChange}
                              setLoginModal={setLoginModal}
                              isGuestUser={isGuestUser}
                            />
                          ) : (
                            <div className="analyze-info-item">
                              <h6 className="engine-name-wrapper">{name}</h6>
                            </div>
                          )}
                          <div className="analyze-info-core-item-wraper">
                            <span style={{ margin: 'auto 0px' }}>
                              Server:&nbsp;
                            </span>
                            <CustomDropDown
                              coreIndex={coreIndex}
                              type={'cores'}
                              items={engine[name]}
                              engineName={name}
                              plans={plans}
                              handelCoreChange={handelCoreChange}
                              setLoginModal={setLoginModal}
                              isGuestUser={isGuestUser}
                            />
                          </div>
                        </div>
                        <div className="mb-engines-list-info-bottom mb-2">
                          <div>
                            <DisplayEngineOption
                              engineName={name}
                              enginesOptionsList={enginesOptionsList}
                              handleOptionChange={handleOptionChange}
                              needOption="boolean"
                              setLoginModal={setLoginModal}
                              isGuestUser={isGuestUser}
                            />
                          </div>
                          <div className="analyze-button-wrapper">
                            {isServerOrdering[name] && loadingOrderedServer()}
                            {servers &&
                              (!servers[name] || initiateFullAnalysis) &&
                              !isServerOrdering[name] &&
                              showAnalyzeButton(
                                plans,
                                engineList[0][name][coreIndex[name]],
                                (
                                  engineList[0][name][coreIndex[name]] ||
                                  engineList[0][name][0]
                                ).price_per_minute
                              ) &&
                              (!initiateFullAnalysis ? (
                                <button
                                  id={`${ENGINES_NAMES[name].includes('Stockfish')
                                    ? 'analyzeStockfishBtn'
                                    : ''
                                    }`}
                                  className={
                                    !analysisLoader
                                      ? 'analyze-button'
                                      : 'analyze-button-loader'
                                  }
                                  disabled={
                                    analysisLoader || analysisStopLoader
                                  }
                                  onClick={() => {
                                    if (!Boolean(sessionStorage.getItem('tabs')) && Object.keys(servers).length) {
                                      setSubModal('currently_analyzing')
                                    } else {
                                      sessionStorage.setItem('tabs', true)
                                      handleOrderServer(
                                        engineList[0][name][coreIndex[name]],
                                        name
                                      )
                                    }
                                  }}
                                >
                                  Analyze
                                </button>
                              ) : (
                                <button
                                  className="analyze-button"
                                  onClick={() => {
                                    setOpenAnalysisModal(true);
                                  }}
                                >
                                  Analyze
                                </button>
                              ))}
                            {((servers &&
                              !servers[name] &&
                              !isServerOrdering[name] &&
                              !showAnalyzeButton(
                                plans,
                                engineList[0][name][coreIndex[name]],
                                (
                                  engineList[0][name][coreIndex[name]] ||
                                  engineList[0][name][0]
                                ).price_per_minute
                              )) ||
                              isGuestUser) && (
                              <button
                                className="analyze-button-disabled"
                                onClick={() => {
                                  if (isGuestUser) {
                                    setLoginModal(true);
                                  }
                                }}
                              >
                                Analyze
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {savedAnalyzeInfo &&
                  savedAnalyzeInfo.map((info, index) => {
                    if (info.name === name && info.analysis) {
                      return (
                        <SavedAnalysisArea key={index} serverName={name} />
                      );
                    }
                    return null;
                  })}
              </div>
            </Accordion.Body>
          ))}
        </Accordion.Item>
        <div ref={enginesEndRef} />
      </Accordion>
      <CoinsCardModal
        showModal={openCoinsModal}
        setShowModal={setOpenCoinsModal}
        isGuestUser={isGuestUser}
      />
      <StopAnalysisModal
        isOpen={openStopAnalysisModal}
        setIsOpen={setOpenAnalysisModal}
        message={
          'Please stop full-game analysis to analyse the current position.'
        }
      />
    </>
  );
};

export default connect(mapStateToProps, {
  setSavedAnalyzeInfo,
  setAnalyzingFenTabIndx,
  setSubModal,
  connectToFree,
})(React.memo(MobileEnginesList));
