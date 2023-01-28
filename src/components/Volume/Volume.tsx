import { VolumeOffIcon, VolumeLowIcon, VolumeHighIcon } from "../../icons";
import styles from "./Volume.module.scss";

interface VolumeProps {
  value: number;
}

const Volume = ({ value }: VolumeProps) => {
  value = Math.min(1, Math.max(0, value));

  let VolumeIcon: typeof VolumeHighIcon;

  if (value > 0.5) {
    VolumeIcon = VolumeHighIcon;
  } else if (value > 0) {
    VolumeIcon = VolumeLowIcon;
  } else {
    VolumeIcon = VolumeOffIcon;
  }

  return (
    <div className={styles["volume"]} style={{ "--volume": value }}>
      <div className={styles["volume__bar"]}>
        <div className={styles["volume__progress"]}></div>
      </div>
      <VolumeIcon />
    </div>
  );
};

export default Volume;
