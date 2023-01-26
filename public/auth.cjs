const { BrowserWindow } = require("electron");
const axios = require("axios");
const url = require("url");
const qs = require("querystring");

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=3cce2f3ae9af4c47a93837c625927e65&redirect_uri=http://localhost/callback&scope=user-read-email+user-read-private+user-read-playback-state+user-modify-playback-state+user-read-currently-playing+user-read-playback-position&response_type=code";

let authWindow = null;

const parseAuthURL = (authUrl) => {
  const urlParts = url.parse(authUrl, true);
  const query = urlParts.query;
  return query.code;
};

const createAuthWindow = () => {
  destroyAuthWindow();

  authWindow = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  authWindow.loadURL(AUTH_URL);

  const {
    session: { webRequest },
  } = authWindow.webContents;

  const filter = {
    urls: ["http://localhost/callback*"],
  };

  webRequest.onBeforeRequest(filter, async ({ url }) => {
    console.log(url);
    return destroyAuthWindow();
  });

  authWindow.on("closed", () => {
    win = null;
  });
};

const destroyAuthWindow = () => {
  if (!authWindow) return;
  authWindow.close();
  authWindow = null;
};

module.exports = {
  createAuthWindow,
  destroyAuthWindow,
};
