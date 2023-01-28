import React from "react";
import cn from "clsx";
import styles from "./BufferedImage.module.scss";

interface BufferedImageProps extends React.HTMLProps<HTMLDivElement> {
  url?: string;
  transition?: number;
  fullOpacity?: number;
  children?: React.ReactNode;
}

const BufferedImage = ({
  url,
  transition = 300,
  fullOpacity = 1,
  children,
  className,
  style = {},
  ...divProps
}: BufferedImageProps) => {
  const [isReady, setIsReady] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState(url);
  const timeout = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    setIsReady(false);
    window.clearTimeout(timeout.current);

    if (!url) return;
    let hasLoaded = false;
    let hasTransitioned = false;
    const newImage = new Image();

    const resolve = () => {
      // Make sure that URL hasn't changed during transition
      if (url !== newImage.src) return;
      setCurrentUrl(url);
      setIsReady(true);
    };

    timeout.current = window.setTimeout(() => {
      hasTransitioned = true;
      if (hasLoaded) resolve();
    }, transition);

    newImage.onload = () => {
      hasLoaded = true;
      if (hasTransitioned) resolve();
    };
    newImage.src = url;

    return () => window.clearTimeout(timeout.current);
  }, [url, transition]);

  return (
    <div
      className={cn(styles["img"], isReady && styles["img--show"], className)}
      style={
        {
          ...style,
          ...(currentUrl && { "--image-url": `url(${currentUrl})` }),
          "--transition-time": transition,
          "--full-opacity": fullOpacity,
        } as React.CSSProperties
      }
      {...divProps}>
      {children}
    </div>
  );
};

export default BufferedImage;
