import CLOUD_ACTION_TYPES from '../constants/cloud-action-types';
import { connectToFree, connectToPro } from '../connections';
import { parseProAnalysis } from '../utils/chess-utils';
import { getUserServersData } from '../utils/api';

let newProAnalyzers = []; // New Pro Analyzers to apply on new server connect or disconnecct
export function cloudMiddleware({ getState, dispatch }) {
  return function (next) {
    return function (action) {
      switch (action.type) {
        case CLOUD_ACTION_TYPES.SET_VIDEOS_FEN: {
          try {
            // CHECK VIDEOS FROM BACKEND
          } catch (e) {
            console.error('INVALID VIDEOS: ', e);
            return;
          }
          break;
        }

        case CLOUD_ACTION_TYPES.SET_GAMES: {
          try {
            // CHECK GAMES DATA FROM BACKEND
          } catch (e) {
            console.error('INVALID GAMES: ', e);
            return;
          }
          break;
        }

        ///////////
        ////// SET FREE ANALYZER CONTAINING WSSConnection, Analysis, Analysis State
        ///////////
        case CLOUD_ACTION_TYPES.CONNECT_TO_FREE: {
          try {
            const cloudState = getState().cloud;
            const { token } = cloudState;

            /// TODO! CHECK FREE ANALYZER

            const onConnect = (freeAnalyzer) => {
              return dispatch({
                type: CLOUD_ACTION_TYPES.SET_FREE_ANALYZER,
                payload: { freeAnalyzer },
              });
            };

            const onGetAnalyze = (freeAnalysisData) => {
              return dispatch({
                type: CLOUD_ACTION_TYPES.SET_FREE_ANALYSIS_DATA,
                payload: { freeAnalysisData },
              });
            };

            connectToFree(token, onConnect, onGetAnalyze);
          } catch (e) {
            console.error('INVALID FREE ANALYZER: ', e);
            return;
          }
          break;
        }

        ///////////
        ////// PARSE FREE ANALYSIS DATA AND SET
        ///////////
        case CLOUD_ACTION_TYPES.SET_FREE_ANALYSIS_DATA: {
          try {
            const freeAnalysisData = action.payload.freeAnalysisData;

            if (
              freeAnalysisData.error ||
              typeof freeAnalysisData.json !== 'string'
            ) {
              action.payload.isAnalysing = false;
              action.payload.freeAnalysisData = null;
            } else {
              action.payload.isAnalysing = true;
              action.payload.freeAnalysisData = JSON.parse(
                freeAnalysisData.json
              );
            }
          } catch (e) {
            console.error('INVALID ANALYSIS DATA: ', e);
            return;
          }
          break;
        }

        ///////////
        ////// CONNECTING TO PRO ANALYZING SERVERS
        ///////////
        case CLOUD_ACTION_TYPES.CONNECT_TO_PRO: {
          try {
            // CHECK WSS CHANNELS FROM CLOUD SERVICE
            const state = getState();
            const {
              fenArr,
              proAnalyzers,
              computedMoveScores,
              initiateFullAnalysis,
              isColorSwitched,
              plans,
            } = state.cloud;

            const fullAnalysisFen = fenArr && fenArr.length && fenArr[0];

            const fullAnalysisOn =
              action.payload && action.payload.fullAnalysisOn
                ? action.payload.fullAnalysisOn
                : initiateFullAnalysis;

            const numPV = fullAnalysisOn ? 1 : state.cloud.numPV;
            
          
           
          
            const {
              fen: boardFen,
              activePgnTab,
              analyzingFenTabIndx,
              switchedTabAnalyzeFen,
            } = state.board;

            const _getFen = () => {
              if (fullAnalysisFen && fullAnalysisOn) {
                return fullAnalysisFen;
              }

              if (
                activePgnTab === analyzingFenTabIndx ||
                analyzingFenTabIndx === null
              ) {
                let newFen = boardFen;
                if (isColorSwitched) {
                  newFen = boardFen.includes(' w ')
                    ? boardFen.replace(' w ', ' b ')
                    : boardFen.replace(' b ', ' w ');
                }
                return newFen;
              }

              let newFen = switchedTabAnalyzeFen;
              if (isColorSwitched) {
                newFen = switchedTabAnalyzeFen.includes(' w ')
                  ? switchedTabAnalyzeFen.replace(' w ', ' b ')
                  : switchedTabAnalyzeFen.replace(' b ', ' w ');
              }

              return newFen;
            };

            const fenToAnalyze = _getFen();
            const newProWSSChannels = [];
            for (const [engine, params] of Object.entries(
              action.payload.proWSSChannels
            )) {
              newProWSSChannels.push({
                name: engine,
                channel: params[1],
                temp: params[0].for_guests,
                isSubscription: plans.subscription,
                cores: params[0].cores,
              });
            }

            console.log('PRO ANALYZERS: ', JSON.stringify(proAnalyzers));

            // const newProWSSChannels = action.payload.proWSSChannels; // New Wss Channels list from backend.

            console.log(
              'NEW WSS CHANNELS GOT: ',
              JSON.stringify(newProWSSChannels)
            );

            ////
            //  Filter current Pro Analyzer. If WSS url of analyzer doesn't exists in new WSS Channels list from backend, than remove it
            ////

            newProAnalyzers = proAnalyzers
              ? proAnalyzers.filter((pa) => {
                const connectionExists = newProWSSChannels.some(
                  (nwssc) => pa.analyzer.url === nwssc.channel
                );

                if (!connectionExists) {
                  pa.analyzer.close();
                  return false;
                }
                return true;
              })
              : [];
            console.log('newProAnalyzers', newProAnalyzers);

            ///
            // Create New Connection if new Wss Channel added
            ///

            newProWSSChannels.forEach((wsc) => {
              const connectionExists = newProAnalyzers.some((pa) => {
                return pa.analyzer.url === wsc.channel;
              });
              if (!connectionExists) {
                const onConnect = (socket, is_socket_timeout_case = false) => {
                  if (!Boolean(sessionStorage.getItem("tabs"))) {
                    console.log("create tabs")
                    sessionStorage.setItem("tabs", true)
                  }

                  if (is_socket_timeout_case) {
                    const state = getState();
                    const { proAnalyzers } = state.cloud;
                    newProAnalyzers = proAnalyzers;
                  }

                  console.log('YOHOOO CONNECT: ', socket);
                  newProAnalyzers.push({
                    name: wsc.name,
                    analyzer: socket,
                    temp: Boolean(wsc.temp), // If the ordered server is temporary
                    isSubscription: wsc.isSubscription, // If the current user is subscribed. NOT a single package
                    cores: wsc.cores,
                  });

                  return dispatch({
                    type: CLOUD_ACTION_TYPES.SET_PRO_ANALYZERS,
                    payload: {
                      proAnalyzers: newProAnalyzers,
                      fullAnalysisOn: fullAnalysisOn,
                      fenArr: fenArr,
                      computedMoveScores: computedMoveScores,
                    },
                  });
                };

                const onGetAnalyze = (proAnalysisData) => {
                  const newState = getState();
                  const {
                    fullAnalysisOn,
                    fullAnalysisDepth,
                    isColorSwitched,
                    proAnalyzers,
                  } = newState.cloud;
                  let { fenArr, computedMoveScores } = newState.cloud;
                  const numPV = fullAnalysisOn ? 1 : newState.cloud.numPV;
                  const fullAnalysisFen = fenArr && fenArr.length && fenArr[0];

                  const {
                    activePgnTab,
                    analyzingFenTabIndx,
                    switchedTabAnalyzeFen,
                    fen: boardFen,
                  } = newState.board;

                  const _getFen = () => {
                    if (fullAnalysisFen && fullAnalysisOn) {
                      return fullAnalysisFen;
                    }

                    if (
                      activePgnTab === analyzingFenTabIndx ||
                      analyzingFenTabIndx === null
                    ) {
                      let newFen = boardFen;

                      if (isColorSwitched) {
                        newFen = boardFen.includes(' w ')
                          ? boardFen.replace(' w ', ' b ')
                          : boardFen.replace(' b ', ' w ');
                      }
                      return newFen;
                    }

                    let newFen = switchedTabAnalyzeFen;

                    if (isColorSwitched) {
                      newFen = switchedTabAnalyzeFen.includes(' w ')
                        ? switchedTabAnalyzeFen.replace(' w ', ' b ')
                        : switchedTabAnalyzeFen.replace(' b ', ' w ');
                    }

                    return newFen;
                  };

                  const fen = _getFen();
                  if (
                    newProAnalyzers &&
                    Object.keys(newProAnalyzers).length > 0 &&
                    !fullAnalysisOn
                  ) {
                    let dataFromSessionStorage =
                      sessionStorage.getItem('latest_analyze_info') || [];
                    let merged = [];

                    if (dataFromSessionStorage.length <= 0) {
                      merged.push(...newProAnalyzers);
                      merged.map((item) => (item.fen = fenToAnalyze));
                    } else {
                      dataFromSessionStorage = JSON.parse(
                        dataFromSessionStorage
                      );
                      for (let i = 0; i < newProAnalyzers.length; i++) {
                        merged.push({
                          ...newProAnalyzers[i],
                          ...{ fen: fenToAnalyze },
                        });
                      }
                      merged.push(
                        ...dataFromSessionStorage.filter(
                          (item) =>
                            !newProAnalyzers.some(
                              (proAnalyzers) => proAnalyzers.name === item.name
                            )
                        )
                      );
                    }

                    if (
                      !fullAnalysisOn &&
                      merged &&
                      merged[0] &&
                      merged[0].analysis &&
                      merged[0].analysis.variations.length
                    ) {
                      sessionStorage.setItem(
                        'latest_analyze_info',
                        JSON.stringify(merged)
                      );
                    }
                  }
                  const parsedAnalysisData = parseProAnalysis(
                    proAnalysisData,
                    fen
                  );

                  // parsedAnalysisData is null when moves dont exist in data from Stockfish
                  if (parsedAnalysisData) {
                    //Make a duplicate of proAnalyzers list, because find method works with referance and will change original list
                    const cpProAnalyzers = [...newState.cloud.proAnalyzers];
                    const analyzer = cpProAnalyzers.find((pa) => {
                      return pa.analyzer.url === wsc.channel;
                    });
                    console.assert(analyzer);
                    const {
                      stopped,
                      rowId,
                      depth,
                      variation,
                    } = parsedAnalysisData;
                    if (analyzer) {
                      if (stopped) {
                        analyzer.isAnalysing = false;
                      } else {
                        analyzer.isAnalysing = true;
                        analyzer.analysis = analyzer.analysis
                          ? analyzer.analysis
                          : {};
                        analyzer.analysis.depth = depth;
                        analyzer.analysis.engine = wsc.name;
                        if (!analyzer.analysis.variations)
                          analyzer.analysis.variations = [];
                        if (rowId + 1 <= numPV[wsc.name])
                          analyzer.analysis.variations[rowId] = variation;
                      }
                    }
                    if (
                      parsedAnalysisData?.rowId == 0 &&
                      parsedAnalysisData?.depth == fullAnalysisDepth &&
                      fullAnalysisOn
                    ) {
                      computedMoveScores.push({
                        score: parsedAnalysisData.variation.score,
                        pgn: parsedAnalysisData.variation.pgn,
                      });

                      if (computedMoveScores.length >= 2) {
                        const lastIndx = computedMoveScores.length - 1;
                        const prevIndx = computedMoveScores.length - 2;
                        const lastMvScore = computedMoveScores[lastIndx].score;
                        const prevMvScore = computedMoveScores[prevIndx].score;
                        if (
                          !lastMvScore.includes('#') &&
                          !prevMvScore.includes('#')
                        ) {
                          const scoreDiff = Math.abs(lastMvScore - prevMvScore);
                          console.log('COMPUTED SCORE DIFFERENCE:', scoreDiff);

                          if (scoreDiff < 1 && scoreDiff > 0.5) {
                            computedMoveScores[lastIndx].type = 'inaccuracy';
                          } else if (scoreDiff >= 1 && scoreDiff < 2) {
                            computedMoveScores[lastIndx].type = 'mistake';
                          } else if (scoreDiff >= 2) {
                            computedMoveScores[lastIndx].type = 'blunder';
                          }
                        } else if (
                          !lastMvScore.includes('#') &&
                          prevMvScore.includes('#')
                        ) {
                          if (+lastMvScore < 2) {
                            computedMoveScores[lastIndx].type = 'blunder';
                          } else if (+lastMvScore >= 2 && +lastMvScore < 3) {
                            computedMoveScores[lastIndx].type = 'mistake';
                          } else {
                            computedMoveScores[lastIndx].type = 'inaccuracy';
                          }
                        }
                      }

                      fenArr.shift();
                      if (!fenArr.length) {
                        analyzer.isAnalysing = false;
                        cpProAnalyzers.forEach((pa) => {
                          pa.analyzer.send('stop');
                        });
                        return;
                      }

                      cpProAnalyzers.forEach((pa) => {
                        pa.analyzer.send('stop');
                        pa.analyzer.send(`setoption name MultiPV value 1`);
                        pa.analyzer.send(`position fen ${fenArr[0]}`);
                        pa.analyzer.send('go infinite');
                      });
                    }

                    return dispatch({
                      type: CLOUD_ACTION_TYPES.SET_PRO_ANALYZERS,
                      payload: {
                        proAnalyzers: cpProAnalyzers,
                        fullAnalysisOn: fullAnalysisOn,
                        fenArr: fenArr,
                        computedMoveScores: computedMoveScores,
                      },
                    });
                  }
                };
                const onDisconnect = async (socket) => {
                  console.log('YOHOOO DISCONNECT: ', socket);
                  dispatch({
                    type: CLOUD_ACTION_TYPES.SET_PRO_ANALYZERS,
                    payload: {
                      proAnalyzers: newProAnalyzers.filter((pa) => {
                        return pa.analyzer.url !== socket.url;
                      }),
                      fullAnalysisOn: false,
                      fenArr: [],
                      computedMoveScores: computedMoveScores,
                    },
                  });
                  if (Boolean(sessionStorage.getItem('tabs'))) {
                    const serversData = await getUserServersData();
                    for (const engine of Object.keys(serversData.servers)) {
                      if (socket.url === serversData.servers[engine][1]) {
                        connectToPro(
                          socket.url,
                          fenToAnalyze,
                          onConnect,
                          onGetAnalyze,
                          onDisconnect,
                          fullAnalysisOn ? 1 : numPV[wsc.name],
                          true
                        );
                      }
                    }
                  }
                };
                connectToPro(
                  wsc.channel,
                  fenToAnalyze,
                  onConnect,
                  onGetAnalyze,
                  onDisconnect,
                  fullAnalysisOn ? 1 : numPV[wsc.name]
                );
              }
            });
          } catch (e) {
            console.error('INVALID PRO ANALYZERS: ', e);
            return;
          }
          break;
        }

        case CLOUD_ACTION_TYPES.UPDATE_NUM_PV: {
          try {
            const state = getState();
            const currentPV = state.cloud.numPV;
            const numPV = action.payload.numPV;
            const engineName = Object.keys(numPV)[0];
            const numPVUpdated = {
              [engineName]: currentPV[engineName] + numPV[engineName],
            };
            const newPV = { ...currentPV, ...numPVUpdated };

            if (newPV[engineName] > 15 || newPV[engineName] < 1) {
              console.error('NUMBER OF PV LINES OUT OF RANGE');
              return;
            }
            action.payload.numPV = newPV;
            const proAnalyzers = state.cloud.proAnalyzers;
            proAnalyzers.find((pa) => {
              if (pa.name === engineName) {
                pa.analyzer.send('stop');
                pa.analyzer.send(
                  `setoption name MultiPV value ${newPV[engineName]}`
                );
                pa.analyzer.send('go infinite');
              }
            });
          } catch (e) {
            console.error('FAILED SETTING PV: ', e);
            return;
          }
          break;
        }

        // DEFAULT
        ////
        default: {
          break;
        }
      }
      return next(action);
    };
  };
}

export default [cloudMiddleware];
