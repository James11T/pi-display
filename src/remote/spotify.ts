import * as API from "./api";
import { HydratedArtist, PlaybackState, Queue, Tokens } from "./spotifyAPITypes";

const { VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_CLIENT_SECRET, VITE_SPOTIFY_REDIRECT_URI } =
  import.meta.env;

type PartialSome<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const getAccessTokens = async (authToken: string) => {
  const response = await API.post<Tokens>("https://accounts.spotify.com/api/token", {
    body: {
      grant_type: "authorization_code",
      code: authToken,
      redirect_uri: VITE_SPOTIFY_REDIRECT_URI,
      client_id: VITE_SPOTIFY_CLIENT_ID,
      client_secret: VITE_SPOTIFY_CLIENT_SECRET,
    },
    contentType: "encodedForm",
    headers: {
      "User-Agent": "spotipi-dash",
    },
  });

  return response;
};

const refreshAccessTokens = async (refreshToken: string) => {
  const response = await API.post<PartialSome<Tokens, "refresh_token">>(
    "https://accounts.spotify.com/api/token",
    {
      body: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: VITE_SPOTIFY_CLIENT_ID,
        client_secret: VITE_SPOTIFY_CLIENT_SECRET,
      },
      contentType: "encodedForm",
      headers: {
        "User-Agent": "spotipi-dash",
      },
    }
  );

  return response;
};

const getPlaybackState = async (accessToken: string) => {
  const response = await API.get<PlaybackState | null>("https://api.spotify.com/v1/me/player", {
    accessToken,
  });

  return response;
};

const getQueue = async (accessToken: string) => {
  const response = await API.get<Queue>("https://api.spotify.com/v1/me/player/queue", {
    accessToken,
  });

  return response;
};

const getArtist = async (accessToken: string, id: string) => {
  const response = await API.get<HydratedArtist>(`https://api.spotify.com/v1/artists/${id}`, {
    accessToken,
  });
  return response;
};

const resumePlayback = async (accessToken: string) => {
  const response = await API.put("https://api.spotify.com/v1/me/player/play", { accessToken });
  return response;
};

const pausePlayback = async (accessToken: string) => {
  const response = await API.put("https://api.spotify.com/v1/me/player/pause", { accessToken });
  return response;
};

const skipNext = async (accessToken: string) => {
  const response = await API.post("https://api.spotify.com/v1/me/player/next", { accessToken });
  return response;
};

const skipPrevious = async (accessToken: string) => {
  const response = await API.post("https://api.spotify.com/v1/me/player/previous", { accessToken });
  return response;
};

const toggleShuffle = async (accessToken: string, state: boolean) => {
  const response = await API.put(`https://api.spotify.com/v1/me/player/shuffle?state=${state}`, {
    accessToken,
  });
  return response;
};

const setRepeatMode = async (accessToken: string, state: "off" | "context" | "track") => {
  const response = await API.put(`https://api.spotify.com/v1/me/player/repeat?state=${state}`, {
    accessToken,
  });
  return response;
};

export {
  getAccessTokens,
  refreshAccessTokens,
  getPlaybackState,
  getQueue,
  getArtist,
  resumePlayback,
  pausePlayback,
  skipNext,
  skipPrevious,
  toggleShuffle,
  setRepeatMode,
};
export type { Tokens };
