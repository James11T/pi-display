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
import { useSpotify } from "../../hooks/useSpotify";
import BufferedImage from "../BufferedImage/BufferedImage";

const App = () => {
  const spotify = useSpotify();

  return (
    <div className={styles["app"]}>
      <div className={styles["now-playing"]}>
        <BufferedImage
          className={styles["now-playing__album-art"]}
          url={spotify.playbackState?.item?.album.images[0].url}></BufferedImage>
        {/* now-playing__album-art sets background image */}
        <BufferedImage
          className={styles["now-playing__details"]}
          url={spotify.playbackState?.item ? spotify.currentArtist?.images[0].url : undefined}
          fullOpacity={0.4}>
          {/* contains pseudo element for background image */}
          <div className={styles["now-playing__title-text"]}>
            <h1>{spotify.playbackState?.item?.name ?? "Nothing"}</h1>
            <h2>
              {spotify.playbackState?.item?.artists.map((artist) => artist.name).join(", ") ??
                "Nobody"}
            </h2>
          </div>
        </BufferedImage>
      </div>
      <div className={styles["controls"]}>
        <Track
          length={(spotify.playbackState?.item?.duration_ms ?? 0) / 1000}
          progress={
            spotify.playbackState?.item
              ? spotify.playbackState.progress_ms / spotify.playbackState.item.duration_ms
              : 0
          }
        />
        <div className={styles["controls__buttons"]}>
          <button
            className={cn(spotify.playbackState?.shuffle_state && styles["controls__active"])}
            onClick={spotify.toggleShuffle}>
            <ShuffleIcon />
          </button>
          <button onClick={spotify.skipPrevious}>
            <BackIcon />
          </button>
          <button onClick={spotify.togglePlaying} className={styles["controls__play-button"]}>
            {spotify.playbackState?.is_playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={spotify.skipNext}>
            <NextIcon />
          </button>
          <button
            className={cn(
              spotify.playbackState?.repeat_state !== "off" && styles["controls__active"]
            )}
            onClick={spotify.stepRepeatState}>
            {spotify.playbackState?.repeat_state === "track" ? (
              <RepeatOneIcon />
            ) : (
              <RepeatAllIcon />
            )}
          </button>
        </div>
      </div>
      <div className={styles["up-next"]}>
        <h1>Next Up</h1>
        <div className={styles["up-next__songs"]}>
          {spotify.queue &&
            spotify.queue.queue.map((song, index) => (
              <Song
                key={`${index}__${song.id}`}
                title={song.name}
                artists={song.artists.map((artist) => artist.name)}
                icon={song.album.images[0].url}
              />
            ))}
          {!spotify.queue ||
            (spotify.queue.queue.length === 0 && (
              <span className={styles["up-next__no-queue"]}>Nothing...</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;
