// import { error } from 'jquery';
import { CLOUD_URL } from '../constants/cloud-params';
import { clearSavedAnalyzeInfoFromSessionStorage } from './utils';

export async function getVideos(token, fen) {
  const url = `${CLOUD_URL}/get_videos`;

  const data = new FormData();
  data.append('fen', fen);

  const response = await fetch(url, {
    method: 'POST',
    body: data,
    headers: {
      'Access-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  const videos = await response.json();
  return videos.video;
}

export async function getUserServersData() {
  try {
    const url = '/user_account/user_servers_info';
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function getUserNotifiactionData() {
  try {
    const url = '/user_account/user_notifications_info';
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error('Error Notifiaction:', error);
  }
}

export async function getUserAccountData() {
  try {
    const url = '/user_account/user_account_info';
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    const responseJson = await response.json();

    return responseJson;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function getUserPlansData() {
  try {
    const url = '/user_account/user_plans_info';
    const response = await fetch(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    throw new Error('Something went wrong');
  }
}

export async function getAvailableServers() {
  const url = '/api/available_servers';
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function getEnginesOptions() {
  const url = '/billing/get_engines_options_list';
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function orderServer(core, serverName, options) {
  const url = `/billing/order_server?cores=${core}&engine=${serverName}&options=${JSON.stringify(
    options
  )}&plugin=0`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function stopServer(serverName) {
  const url = `/billing/stop_server?engine=${serverName}`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function pingAlive(userFullInfo) {
  const { servers } = userFullInfo;
  const engines = Object.keys(servers);
  let response = {};
  for (let i = 0; i < engines.length; i++) {
    response = await fetch(`/api/ping_alive?engine=${engines[i]}`, {
      method: 'GET',
    });
  }
  if (!response.ok) {
    throw new Error('Something went wrong');
  }
  return await response.json();
}

export async function sendResetPasswordEmail(data, onSuccess, onError) {
  const response = await fetch('/user_account/password/reset/', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
    error: (xhr) => onError(xhr),
    onSuccess: (response) => onSuccess(response),
  });
  return response.json();
}

export const logout = () => {
  const response = fetch('/user_account/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(() => {
    clearSavedAnalyzeInfoFromSessionStorage();
    localStorage.removeItem('logged_out');
    window.location.href = '/auth/signin';
  });
};

export const changePassword = async (data, token) => {
  const response = await fetch(`/user_account/change_password/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};

export const updateUser = async (data, token) => {
  const response = await fetch(`/user_account/update_profile/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};

export const manageSubscription = async () => {
  fetch('/billing/customer_portal/', {
    method: 'GET',

    redirect: 'follow',
  }).then(async (response) => {
    const rspJson = await response.json();
    if (rspJson.redirectUrl) {
      window.location.href = rspJson.redirectUrl;
    }
  });
};

export async function searchPlayers(playerName) {
  const url = `${CLOUD_URL}/dbsearch/find_player`;

  const response = await fetch(`${url}?subname=${playerName}`);

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function createFolder(path, name) {
  const url = `${CLOUD_URL}/user_account/create-folder/`;
  const data = new FormData();
  data.append('path', path);
  data.append('name', name);
  const response = await fetch(url, {
    method: 'POST',
    body: data,
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function getFiles(id, filePath, token) {
  const url = `${CLOUD_URL}/user_account/get-decrypted-file?path=${encodeURIComponent(
    filePath
  )}&file_id=${id}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }
  const result = await response.json();
  return result.data;
}

export async function setDashboardSettings(
  token,
  modeData,
  arrowsData,
  boardData,
  piecesData
) {
  const data = {
    is_dark: modeData,
    arrows_enabled: arrowsData,
    board_theme: boardData,
    pieces_theme: piecesData,
  };
  return fetch(`/user_account/update_dashboard_settings/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

export async function updatePgnTags(id, name, header, token) {
  const url = `${CLOUD_URL}/user_account/update-pgn-tags/`;
  let data = new FormData();
  data.append('pgn_id', id);
  data.append('name', name);
  header.white && header.white.length && data.append('white', header.white);
  header.black && header.black.length && data.append('black', header.black);
  header.tournament &&
    header.tournament.length &&
    data.append('tournament', header.tournament);
  header.ecoCode &&
    header.ecoCode.length &&
    data.append('eco_code', header.ecoCode);
  header.whiteElo &&
    header.whiteElo.length &&
    data.append('elo_white', header.whiteElo);
  header.blackElo &&
    header.blackElo.length &&
    data.append('elo_black', header.blackElo);
  header.round && header.round.length && data.append('round', header.round);
  header.subround &&
    header.subround.length &&
    data.append('subround', header.subround);
  header.result && header.result.length && data.append('result', header.result);
  header.date && header.date.length && data.append('date', header.date);
  header.annotator &&
    header.annotator.length &&
    data.append('annotator', header.annotator);
  header.whiteTeam &&
    header.whiteTeam.length &&
    data.append('white_team', header.whiteTeam);
  header.blackTeam &&
    header.blackTeam.length &&
    data.append('black_team', header.blackTeam);
  header.source && header.source.length && data.append('source', header.source);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${token}`,
    },
    body: data,
  });
  if (!response.ok) {
    throw new Error('Something went wrong');
  }
  return await response.json();
}

export async function getPgnTags(pgnIDs, token) {
  const urlParams = 'ids=' + pgnIDs.join('&ids=');
  const url = `${CLOUD_URL}/user_account/get-pgn-tags?${urlParams}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }
  const result = await response.json();
  return result.tags;
}

export async function handleSubscribeDecodeChss() {
  const request_body = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decodeChess: true,
    }),
  };
  const response = await fetch(
    '/billing/create_checkout_session',
    request_body
  );

  const jsonResponse = await response.json();
  window.location.href = jsonResponse.redirectUrl;
}

export async function addOnboadingData(onboardingData) {
  const url = `${CLOUD_URL}/user_account/add_onboarding_data`;

  const request_body = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      onboarding_data: onboardingData,
    }),
  };

  const response = await fetch(url, request_body);

  if (!response.ok) {
    throw new Error('Something went wrong');
  }
}

export async function getLichessDB(fen, searchParamsLichess) {
  let searchParams = '';
  for (const param in searchParamsLichess) {
    if (param === 'speeds' || param === 'ratings') {
      let paramsSep = searchParamsLichess[param].join(',');
      searchParams += `&${param}=${paramsSep}`;
    } else if (
      searchParamsLichess[param] &&
      (typeof searchParamsLichess[param] !== 'string' ||
        searchParamsLichess[param].length)
    ) {
      searchParams += `&${param}=${searchParamsLichess[param]}`;
    }
  }
  const url = `https://explorer.lichess.ovh/lichess?fen=${fen}${searchParams}`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

export async function getLichessDBPlayer(
  fen,
  searchParamsLichessPlayer,
  setIsLoading
) {
  let searchParams = '';
  for (const param in searchParamsLichessPlayer) {
    if (param === 'speeds' || param === 'modes') {
      let paramsSep = searchParamsLichessPlayer[param].join(',');
      searchParams += `&${param}=${paramsSep}`;
    } else if (
      searchParamsLichessPlayer[param] &&
      (searchParamsLichessPlayer[param] !== 'string' ||
        searchParamsLichessPlayer[param].length)
    ) {
      searchParams += `&${param}=${searchParamsLichessPlayer[param]}`;
    }
  }
  const url = `https://explorer.lichess.ovh/player?fen=${fen}${searchParams}`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  let result = '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let receivedLength = 0;
  while (true) {
    const obj = await reader.read();
    const { done, value } = obj;

    if (done) {
      setIsLoading(null);
      break;
    }
    receivedLength += value.length;
    setIsLoading(`${(receivedLength / 1024).toFixed(2)} KB`);
    result = decoder.decode(value, { stream: true });
  }
  console.log('RESULT BEFORE PARSE', result);
  let jsonData = {};
  try {
    jsonData = JSON.parse(result);
  } catch (e) {
    console.error('Error parsing JSON:', result);
    jsonData = JSON.parse(result);
  }
  return jsonData;
}

export async function openLichessGame(id) {
  const url = `https://lichess.org/game/export/${id}?clocks=false`;
  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.text();
}

export async function getChessAIResponse(fen, pgn, token) {
  const url = `${CLOUD_URL}/entertainment/get_chatgpt_analysis/`;

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      pgn: pgn,
      fen: fen,
    }),
  });

  if (!response.ok) {
    console.error('ERROR IN CHESS AI RESPONSE');
    return null;
  }

  return await response.json();
}

export async function sendChessAIReview(
  fen,
  pgnStr,
  gptResponse,
  rate,
  feedback,
  token
) {
  const url = `${CLOUD_URL}/entertainment/gpt_analysis_feedback`;

  const request_body = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({
      fen: fen,
      pgn: pgnStr,
      gpt_response: gptResponse,
      rate: rate,
      feedback: feedback,
    }),
  };

  const response = await fetch(url, request_body);

  if (!response.ok) {
    throw new Error('Something went wrong');
  }
}

export default {
  getVideos,
  getAvailableServers,
  orderServer,
  stopServer,
  pingAlive,
  searchPlayers,
  sendResetPasswordEmail,
  logout,
  changePassword,
  updateUser,
  manageSubscription,
  getFiles,
  getPgnTags,
  handleSubscribeDecodeChss,
  addOnboadingData,
  getUserServersData,
  getUserAccountData,
  getUserPlansData,
  getUserNotifiactionData,
  getLichessDB,
  getLichessDBPlayer,
};
