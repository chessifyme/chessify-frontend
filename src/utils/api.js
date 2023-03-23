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

export async function getUserFullData() {
  const url = '/user_account/user_full_info';
  const response = await fetch(url, {
    method: 'GET',
  });
  const responseJson = await response.json();
  if (responseJson.error === true) {
    window.location.replace('/auth/signin');
  }
  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return responseJson;
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
    window.location.href = '/auth/signin';
  });
};

export const changePassword = async (data, id, token) => {
  const response = await fetch(`/user_account/change_password/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });

  return await response.json();
};

export const updateUser = (data, id, token) => {
  return fetch(`/user_account/update_profile/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
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

export async function getUserAccountInfo() {
  const url = '/user_account/user_info';
  const response = await fetch(url, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error('Something went wrong');
  }

  return await response.json();
}

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

export async function setColorMode(token, id, modeData) {
  const data = { is_dark: modeData };

  fetch(`/user_account/set_dark_mode/${id}/`, {
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

export async function getPgnTags(pgnID, token) {
  const url = `${CLOUD_URL}/user_account/get-pgn-tags?id=${pgnID}`;
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

export default {
  getVideos,
  getUserFullData,
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
  setColorMode,
  getPgnTags,
  handleSubscribeDecodeChss,
  addOnboadingData,
};
