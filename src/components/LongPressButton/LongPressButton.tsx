import React from "react";
import cn from "clsx";
import styles from "./LongPressButton.module.scss";
import CONFIG from "../../config";

interface LongPressButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
  children?: React.ReactNode;
  onShortPress?: () => void;
  onLongPress?: () => void;
}

const LongPressButton = ({
  duration = CONFIG.longPressTime,
  children,
  onShortPress,
  onLongPress,
  className,
  ...buttonProps
}: LongPressButtonProps) => {
  const [isDown, setIsDown] = React.useState(false);
  const timeoutId = React.useRef<number | undefined>(undefined);

  const handleDown = () => {
    setIsDown(true);
    window.clearTimeout(timeoutId.current);
    timeoutId.current = window.setTimeout(() => {
      setIsDown(false);
      onLongPress && onLongPress();
    }, duration);
  };

  React.useEffect(() => {
    const onBlur = () => {
      if (isDown) {
        onShortPress && onShortPress();
      }
      setIsDown(false);
    };

    window.addEventListener("touchend", onBlur);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("touchend", onBlur);
      window.removeEventListener("blur", onBlur);
    };
  }, [isDown, onShortPress]);

  return (
    <button
      onMouseDown={handleDown}
      onTouchStart={handleDown}
      {...buttonProps}
      className={cn(className, styles["long-press-button"])}>
      {children}
    </button>
  );
};

export default LongPressButton;
