import React from "react";
import {
  getArtist,
  getPlaybackState,
  getQueue,
  pausePlayback,
  resumePlayback,
  setRepeatMode,
  toggleShuffle,
} from "../remote/spotify";
import { useQuery } from "react-query";
import { HydratedArtist, PlaybackState, Queue } from "../remote/spotifyAPITypes";

const REPEAT_STATES = ["off", "context", "track"] as const;

interface SpotifyContext {
  playbackState?: PlaybackState;
  queue?: Queue;
  currentArtist?: HydratedArtist;
  togglePlaying: () => void;
  stepRepeatState: () => void;
  toggleShuffle: () => void;
}

interface SpotifyProviderProps {
  accessToken: string;
  children?: React.ReactNode;
}

const spotifyContext = React.createContext<SpotifyContext>({} as SpotifyContext);

const SpotifyProvider = ({ accessToken, children }: SpotifyProviderProps) => {
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [currentArtistId, setCurrentArtistId] = React.useState<string | null>(null);

  const queue = useQuery("queue", () => getQueue(accessToken), {
    refetchInterval: 10_000,
  });

  const artist = useQuery(
    [currentArtistId, "artist"],
    () => getArtist(accessToken, currentArtistId ?? ""),
    { enabled: Boolean(currentArtistId) }
  );

  const playbackState = useQuery("playback_state", () => getPlaybackState(accessToken), {
    refetchInterval: 1000,
    onSuccess: (data) => {
      if (data.item.id !== currentSongId) {
        queue.refetch();
      }
      setCurrentSongId(data.item.id);
      setCurrentArtistId(data.item.artists[0].id);
    },
  });

  const handleTogglePlaying = () => {
    if (!playbackState.data) return;
    if (playbackState.data.is_playing) {
      pausePlayback(accessToken);
    } else {
      resumePlayback(accessToken);
    }
  };

  const handleToggleShuffle = () => {
    if (!playbackState.data) return;
    toggleShuffle(accessToken, !playbackState.data.shuffle_state);
  };

  const stepRepeatState = () => {
    if (!playbackState.data) return;
    setRepeatMode(
      accessToken,
      REPEAT_STATES[
        (REPEAT_STATES.indexOf(playbackState.data.repeat_state) + 1) % REPEAT_STATES.length
      ]
    );
  };

  return (
    <spotifyContext.Provider
      value={{
        playbackState: playbackState.data,
        queue: queue.data,
        currentArtist: artist.data,
        togglePlaying: handleTogglePlaying,
        stepRepeatState,
        toggleShuffle: handleToggleShuffle,
      }}>
      {children}
    </spotifyContext.Provider>
  );
};

const useSpotify = () => React.useContext(spotifyContext);

export { SpotifyProvider, useSpotify };
