import styles from "./Track.module.scss";

interface TrackProps {
  length: number; // seconds
  progress: number; // 0 to 1
}

const secToTimestamp = (length: number) => {
  const mins = String(Math.floor(length / 60));
  const secs = String(Math.floor(length) % 60);

  return `${mins}:${secs.padStart(2, "0")}`;
};

const Track = ({ length, progress }: TrackProps) => {
  progress = Math.min(1, Math.max(0, progress));

  return (
    <div className={styles["track"]}>
      <span>{secToTimestamp(length * progress)}</span>
      <div className={styles["track__bar"]}>
        <div
          className={styles["track__progress"]}
          style={{ "--progress": progress.toFixed(4) }}></div>
      </div>
      <span>{secToTimestamp(length)}</span>
    </div>
  );
};

export default Track;
