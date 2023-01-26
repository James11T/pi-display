import React from "react";
import Track from "../Track/Track";
import Song from "../Song/Song";
import styles from "./App.module.scss";
import cn from "clsx";
import { ReactComponent as BackIcon } from "../../assets/icons/back.svg";
import { ReactComponent as NextIcon } from "../../assets/icons/next.svg";
import { ReactComponent as PlayIcon } from "../../assets/icons/play.svg";
import { ReactComponent as PauseIcon } from "../../assets/icons/pause.svg";
import { ReactComponent as ShuffleIcon } from "../../assets/icons/shuffle.svg";
import { ReactComponent as RepeatAllIcon } from "../../assets/icons/repeat_all.svg";
import { ReactComponent as RepeatOneIcon } from "../../assets/icons/repeat_one.svg";

interface SongData {
  id: string;
  title: string;
  artists: string[];
  albumCover: string;
  splash: string;
  length: number;
}

const REPEAT_STATES = [false, "context", "track"] as const;

interface SongState {
  song?: SongData;
  queue: SongData[];
  playing: boolean;
  progress: number;
  repeat: typeof REPEAT_STATES[number];
  shuffle: boolean;
}

const songStates = {
  daftPunk: {
    id: "a",
    title: "Give Life Back To Music",
    artists: ["Daft Punk"],
    albumCover: "/ram_album_art.jpg",
    splash: "/ram_splash_art.jpg",
    length: 275,
  },
  tommyCash: {
    id: "b",
    title: "Racked",
    artists: ["Tommy Cash"],
    albumCover: "/racked_album_art.jpg",
    splash: "/racked_splash_art.jpg",
    length: 184,
  },
  slipknot: {
    id: "c",
    title: "Not Long For This World",
    artists: ["Slipknot"],
    albumCover: "/wanyk_album_art.jpg",
    splash: "/wanyk_splash_art.jpg",
    length: 184,
  },
};

const url = (value: string) => `url(${value})`;

const App = () => {
  const [currentState, setCurrentState] = React.useState<SongState>({
    song: songStates.daftPunk,
    queue: [...Array(15)].map(
      (_) => Object.values(songStates)[Math.floor(Math.random() * Object.values(songStates).length)]
    ),
    playing: true,
    progress: 0.2,
    repeat: "track",
    shuffle: false,
  });

  const handleRepeatClick = () =>
    setCurrentState((old) => ({
      ...old,
      repeat: REPEAT_STATES[(REPEAT_STATES.indexOf(old.repeat) + 1) % REPEAT_STATES.length],
    }));
  const handleShuffleClick = () => setCurrentState((old) => ({ ...old, shuffle: !old.shuffle }));

  return (
    <div className={styles["app"]}>
      <div
        className={styles["now-playing"]}
        style={{
          "--album-art": currentState.song ? url(currentState.song.albumCover) : "",
          "--splash-art": currentState.song ? url(currentState.song.splash) : "",
        }}>
        <div className={styles["now-playing__album-art"]}></div>
        {/* now-playing__album-art sets background image */}
        <div className={styles["now-playing__details"]}>
          {/* contains pseudo element for background image */}
          <div className={styles["now-playing__title-text"]}>
            <h1>{currentState.song?.title ?? "Nothing"}</h1>
            <h2>{currentState.song?.artists.join(", ") ?? "Nobody"}</h2>
          </div>
        </div>
      </div>
      <div className={styles["controls"]}>
        <Track length={currentState.song?.length ?? 0} progress={currentState.progress} />
        <div className={styles["controls__buttons"]}>
          <button
            className={cn(currentState.shuffle && styles["controls__active"])}
            onClick={handleShuffleClick}>
            <ShuffleIcon />
          </button>
          <button>
            <BackIcon />
          </button>
          <button
            onClick={() => setCurrentState((old) => ({ ...old, playing: !old.playing }))}
            className={styles["controls__play-button"]}>
            {currentState.playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button>
            <NextIcon />
          </button>
          <button
            className={cn(currentState.repeat && styles["controls__active"])}
            onClick={handleRepeatClick}>
            {currentState.repeat === "track" ? <RepeatOneIcon /> : <RepeatAllIcon />}
          </button>
        </div>
      </div>
      <div className={styles["up-next"]}>
        <h1>Next Up</h1>
        <div className={styles["up-next__songs"]}>
          {currentState.queue.map((song, index) => (
            <Song
              key={`${index}__${song.id}`}
              title={song.title}
              artists={song.artists}
              icon={song.albumCover}
            />
          ))}
          {currentState.queue.length === 0 && (
            <span className={styles["up-next__no-queue"]}>Nothing...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
