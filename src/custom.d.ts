declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare namespace React {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
