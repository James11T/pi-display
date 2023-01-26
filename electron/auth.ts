import { BrowserWindow } from "electron";
import axios from "axios";
import url from "url";
import qs from "querystring";
import "dotenv/config";

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env as Record<
  string,
  string
>;

const AUTH_KEY = "auth";
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&scope=user-read-email+user-read-private+user-read-playback-state+user-modify-playback-state+user-read-currently-playing+user-read-playback-position&response_type=code`;

let authWindow: BrowserWindow | null = null;

interface Tokens {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token: string;
}

const loadTokens = (): Tokens | undefined => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return undefined;
  return JSON.parse(raw);
};

const storeTokens = (tokens: Tokens) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(tokens));
};

const getAccessTokens = async (authToken: string): Promise<Tokens | undefined> => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({
      grant_type: "authorization_code",
      code: authToken,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
    }
  );

  if (response.status >= 400) return undefined;
  return response.data;
};

const refreshAccessTokens = async (refreshToken: string): Promise<Tokens | undefined> => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
    }
  );

  if (response.status >= 400) return undefined;
  return response.data;
};

const callbackURLToCode = (callbackURL) => {
  const urlParts = url.parse(callbackURL, true);
  return urlParts.query.code;
};

const createAuthWindow = () => {
  destroyAuthWindow();

  authWindow = new BrowserWindow({
    width: 500,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
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
    authWindow = null;
  });
};

const destroyAuthWindow = () => {
  if (!authWindow) return;
  authWindow.close();
  authWindow = null;
};

export {
  createAuthWindow,
  destroyAuthWindow,
  loadTokens,
  storeTokens,
  getAccessTokens,
  refreshAccessTokens,
  callbackURLToCode,
};
