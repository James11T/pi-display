import React from "react";
import {
  getArtist,
  getPlaybackState,
  getQueue,
  pausePlayback,
  resumePlayback,
  setRepeatMode,
  skipNext,
  skipPrevious,
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
  skipNext: () => void;
  skipPrevious: () => void;
}

interface SpotifyProviderProps {
  accessToken: string;
  children?: React.ReactNode;
}

interface LocalState {
  is_playing?: boolean;
  shuffle_state?: boolean;
  repeat_state?: "off" | "context" | "track";
}

const spotifyContext = React.createContext<SpotifyContext>({} as SpotifyContext);

const SpotifyProvider = ({ accessToken, children }: SpotifyProviderProps) => {
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [currentArtistId, setCurrentArtistId] = React.useState<string | null>(null);
  const [localOverride, setLocalOverride] = React.useState<LocalState>({});

  const setLocalOverrideKey = <K extends keyof LocalState>(key: K, value: LocalState[K]) => {
    setLocalOverride((old) => ({ ...old, [key]: value }));
  };

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
      setLocalOverride({});
    },
  });

  const handleTogglePlaying = () => {
    if (!playbackState.data) return;
    if (playbackState.data.is_playing) {
      pausePlayback(accessToken);
      setLocalOverrideKey("is_playing", false);
    } else {
      resumePlayback(accessToken);
      setLocalOverrideKey("is_playing", true);
    }
  };

  const handleToggleShuffle = () => {
    if (!playbackState.data) return;
    const isShuffling = !playbackState.data.shuffle_state;
    toggleShuffle(accessToken, isShuffling);
    setLocalOverrideKey("shuffle_state", isShuffling);
  };

  const handleSkipNext = () => {
    skipNext(accessToken);
  };

  const handleSkipPrevious = () => {
    skipPrevious(accessToken);
  };

  const stepRepeatState = () => {
    if (!playbackState.data) return;
    const newState =
      REPEAT_STATES[
        (REPEAT_STATES.indexOf(playbackState.data.repeat_state) + 1) % REPEAT_STATES.length
      ];
    setRepeatMode(accessToken, newState);
    setLocalOverrideKey("repeat_state", newState);
  };

  return (
    <spotifyContext.Provider
      value={{
        playbackState: playbackState.data
          ? {
              ...playbackState.data,
              is_playing: localOverride.is_playing ?? playbackState.data.is_playing,
              shuffle_state: localOverride.shuffle_state ?? playbackState.data.shuffle_state,
              repeat_state: localOverride.repeat_state ?? playbackState.data.repeat_state,
            }
          : undefined,
        queue: queue.data,
        currentArtist: artist.data,
        togglePlaying: handleTogglePlaying,
        stepRepeatState,
        toggleShuffle: handleToggleShuffle,
        skipNext: handleSkipNext,
        skipPrevious: handleSkipPrevious,
      }}>
      {children}
    </spotifyContext.Provider>
  );
};

const useSpotify = () => React.useContext(spotifyContext);

export { SpotifyProvider, useSpotify };
