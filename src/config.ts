interface Config {
  spotify: {
    idleDimming: number | undefined;
  };
  hue: {
    refreshInterval: number | undefined;
    updateDebounce: number;
    changingGrace: number; // If the color was manually changed within Xms then delay update by Xms
    defaultEntity?: {
      id: number;
      type: "light" | "group";
    };
  };
  longPressTime: number;
}

const CONFIG: Config = {
  spotify: {
    idleDimming: undefined, // Disabled
  },
  hue: {
    refreshInterval: 2_000,
    updateDebounce: 500,
    changingGrace: 10_000,
    defaultEntity: {
      type: "group",
      id: 3,
    },
  },
  longPressTime: 500,
};

export default CONFIG;
