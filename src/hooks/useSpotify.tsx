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
  queue?: Queue["queue"];
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
  cycles: {
    is_playing: number;
    shuffle_state: number;
    repeat_state: number;
  };
}

const isQueuePossible = (playbackState: PlaybackState | undefined | null) =>
  playbackState &&
  playbackState.context &&
  ["artist", "playlist", "album", "collection"].includes(playbackState.context.type);

const spotifyContext = React.createContext<SpotifyContext>({} as SpotifyContext);

const SpotifyProvider = ({ accessToken, children }: SpotifyProviderProps) => {
  const [currentSongId, setCurrentSongId] = React.useState<string | null>(null);
  const [currentArtistId, setCurrentArtistId] = React.useState<string | null>(null);
  const [localOverride, setLocalOverride] = React.useState<LocalState>({
    cycles: { is_playing: 0, shuffle_state: 0, repeat_state: 0 },
  });

  const setLocalOverrideKey = <K extends keyof LocalState>(key: K, value: LocalState[K]) => {
    setLocalOverride((old) => ({ ...old, [key]: value, cycles: { ...old.cycles, [key]: 2 } }));
  };

  const queue = useQuery("queue", () => getQueue(accessToken), {
    enabled: false,
  });

  const artist = useQuery(
    [currentArtistId, "artist"],
    () => getArtist(accessToken, currentArtistId ?? ""),
    { enabled: Boolean(currentArtistId) }
  );

  const playbackState = useQuery("playback_state", () => getPlaybackState(accessToken), {
    refetchInterval: 1000,
    onSuccess: (data) => {
      if (!data) return;
      if (data.item && data.item.id !== currentSongId && isQueuePossible(data)) {
        queue.refetch();
      }

      if (data.item) {
        setCurrentSongId(data.item.id);
        setCurrentArtistId(data.item.artists[0].id);
      } else {
        setCurrentSongId(null);
        setCurrentArtistId(null);
      }

      // TODO Make this not bad
      setLocalOverride((old) => {
        return {
          is_playing: old.cycles.is_playing > 0 ? old.is_playing : undefined,
          shuffle_state: old.cycles.shuffle_state > 0 ? old.shuffle_state : undefined,
          repeat_state: old.cycles.repeat_state > 0 ? old.repeat_state : undefined,
          cycles: {
            is_playing: Math.max(old.cycles.is_playing - 1, 0),
            shuffle_state: Math.max(old.cycles.shuffle_state - 1, 0),
            repeat_state: Math.max(old.cycles.repeat_state - 1, 0),
          },
        };
      });
    },
  });

  const playbackStateLocal = playbackState.data
    ? {
        ...playbackState.data,
        is_playing: localOverride.is_playing ?? playbackState.data.is_playing,
        shuffle_state: localOverride.shuffle_state ?? playbackState.data.shuffle_state,
        repeat_state: localOverride.repeat_state ?? playbackState.data.repeat_state,
      }
    : undefined;

  const handleTogglePlaying = () => {
    if (!playbackStateLocal) return;
    if (playbackStateLocal.is_playing) {
      pausePlayback(accessToken);
      setLocalOverrideKey("is_playing", false);
    } else {
      resumePlayback(accessToken);
      setLocalOverrideKey("is_playing", true);
    }
  };

  const handleToggleShuffle = () => {
    if (!playbackStateLocal) return;
    const isShuffling = !playbackStateLocal.shuffle_state;
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
    if (!playbackStateLocal) return;
    const newState =
      REPEAT_STATES[
        (REPEAT_STATES.indexOf(playbackStateLocal.repeat_state) + 1) % REPEAT_STATES.length
      ];
    setRepeatMode(accessToken, newState);
    setLocalOverrideKey("repeat_state", newState);
  };

  return (
    <spotifyContext.Provider
      value={{
        playbackState: playbackStateLocal,
        queue: queue.data && isQueuePossible(playbackState.data) ? queue.data.queue : undefined,
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
