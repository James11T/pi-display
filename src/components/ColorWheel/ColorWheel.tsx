import React from "react";
import LightColor from "../../color";
import wheel from "../../assets/wheel.png";
import { SunIcon, PinIcon } from "../../icons";
import styles from "./ColorWheel.module.scss";

interface ColorWheelProps {
  color: LightColor;
  onColorChange?: (color: LightColor) => void;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const ColorWheel = ({ color, onColorChange }: ColorWheelProps) => {
  const [wheelFocused, setWheelFocused] = React.useState(false);
  const [brightnessFocused, setBrightnessFocused] = React.useState(false);
  const ColorWheel = React.useRef<HTMLDivElement>(null);
  const Brightness = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = React.useCallback(
    (position: { x: number; y: number }) => {
      if (wheelFocused && ColorWheel.current) {
        const radius = ColorWheel.current.offsetHeight / 2;
        const center = {
          x: ColorWheel.current.offsetLeft + radius,
          y: ColorWheel.current.offsetTop + radius,
        };

        const dist = Math.sqrt(
          Math.pow(center.x - position.x, 2) + Math.pow(center.y - position.y, 2)
        );
        const sat = dist / radius;

        const angle =
          (Math.atan2((position.y - center.y) / radius, (position.x - center.x) / radius) +
            Math.PI * 2.5) % // +2 to move positive + 0.5 to rotate by 90deg
          (Math.PI * 2); // Bound between [0, 2pi]

        const degs = Math.round(angle * (180 / Math.PI)); // Hue degs 0 to 360
        onColorChange && onColorChange(new LightColor(degs, sat, color.bri).normalise());
      }
      if (brightnessFocused && Brightness.current) {
        const newAlpha = clamp(
          1 - (position.y - Brightness.current.offsetTop) / Brightness.current.clientHeight
        );

        onColorChange && onColorChange(new LightColor(color.hue, color.sat, newAlpha));
      }
    },
    [wheelFocused, brightnessFocused, color.hue, color.sat, color.bri, onColorChange]
  );

  const handleWheelClick = () => {
    setWheelFocused(true);
  };

  const handleBrightnessClick = () => {
    setBrightnessFocused(true);
  };

  React.useEffect(() => {
    const focusLost = () => {
      setWheelFocused(false);
      setBrightnessFocused(false);
    };

    window.addEventListener("blur", focusLost);
    window.addEventListener("mouseup", focusLost);
    window.addEventListener("touchend", focusLost);

    return () => {
      window.removeEventListener("blur", focusLost);
      window.removeEventListener("mouseup", focusLost);
      window.removeEventListener("touchend", focusLost);
    };
  }, []);

  React.useEffect(() => {
    const handleMove = (event: MouseEvent) =>
      handleMouseMove({ x: event.clientX, y: event.clientY });

    const handleTouchMove = (event: TouchEvent) =>
      handleMouseMove({ x: event.touches[0].clientX, y: event.touches[0].clientY });

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mousedown", handleMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMouseMove]);

  const angle = (color.hue * Math.PI) / 180;
  const length = color.sat / 2;
  const pinTop = (0.5 - Math.cos(angle) * length) * 100;
  const pinLeft = (0.5 + Math.sin(angle) * length) * 100;

  return (
    <div className={styles["color-wheel"]}>
      <div
        className={styles["color-wheel__wheel"]}
        ref={ColorWheel}
        onMouseDown={handleWheelClick}
        onTouchStart={handleWheelClick}>
        <img src={wheel} alt="color wheel" draggable="false" />
        <div
          className={styles["color-wheel__pin"]}
          style={{ left: `${pinLeft}%`, top: `${pinTop}%` }}>
          <PinIcon />
        </div>
      </div>
      <div
        className={styles["color-wheel__brightness"]}
        style={{ "--alpha": color.bri }}
        onMouseDown={handleBrightnessClick}
        onTouchStart={handleBrightnessClick}
        ref={Brightness}>
        <div className={styles["brightness__progress"]}></div>
        <SunIcon />
      </div>
    </div>
  );
};

export default ColorWheel;
