import styles from "./Song.module.scss";

interface SongProps {
  icon: string;
  title: string;
  artists: string[];
}

const Song = ({ icon, title, artists }: SongProps) => {
  return (
    <div className={styles["song"]}>
      <img className={styles["song__album-art"]} src={icon} alt="album art" />
      <div>
        <div className={styles["song__title"]}>{title}</div>
        <div className={styles["song__artists"]}>{artists.join(", ")}</div>
      </div>
    </div>
  );
};

export default Song;
