import React from "react";
import LightColor from "../color";
import {
  DimmedIcon,
  FiveIcon,
  FocusIcon,
  FourIcon,
  MoonIcon,
  OneIcon,
  SpaIcon,
  SunIcon,
  ThreeIcon,
  TwoIcon,
} from "../icons";

interface LightingPreset {
  name: string;
  icon: React.FC;
  color: LightColor | null;
  id: string;
}

// Default presets, color can be overwritten
const basePresets: LightingPreset[] = [
  {
    color: new LightColor(47, 0.476, 1),
    name: "Normal",
    icon: SunIcon,
    id: "normal",
  },
  {
    color: new LightColor(37, 0.587, 0.05),
    name: "Night Light",
    icon: MoonIcon,
    id: "night_light",
  },
  {
    color: new LightColor(219, 0.366, 1),
    name: "Focus",
    icon: FocusIcon,
    id: "focus",
  },
  {
    color: new LightColor(263, 0.846, 0.66),
    name: "Relax",
    icon: SpaIcon,
    id: "relax",
  },
  {
    color: new LightColor(47, 0.476, 0.54),
    name: "Dimmed",
    icon: DimmedIcon,
    id: "dimmed",
  },
  {
    color: null,
    name: "Preset 1",
    icon: OneIcon,
    id: "preset_1",
  },
  {
    color: null,
    name: "Preset 2",
    icon: TwoIcon,
    id: "preset_2",
  },
  {
    color: null,
    name: "Preset 3",
    icon: ThreeIcon,
    id: "preset_3",
  },
  {
    color: null,
    name: "Preset 4",
    icon: FourIcon,
    id: "preset_4",
  },
  {
    color: null,
    name: "Preset 5",
    icon: FiveIcon,
    id: "preset_5",
  },
];

type PresetID = typeof basePresets[number]["id"];
type SavedPresets = Record<PresetID, string>;

const usePresets = () => {
  const [presets, setPresets] = React.useState<LightingPreset[]>(basePresets);
  const hasLoaded = React.useRef(false);

  // Load preset overrides from localStorage
  React.useEffect(() => {
    const done = () => {
      hasLoaded.current = true;
    };

    const rawData = localStorage.getItem("presets");
    if (!rawData) return done();
    const data: SavedPresets = JSON.parse(rawData);
    setPresets((old) =>
      old.map((preset) => ({
        ...preset,
        color: data[preset.id] ? LightColor.parse(data[preset.id]) : preset.color,
      }))
    );
    return done();
  }, []);

  // Save presets to localStorage
  React.useEffect(() => {
    if (!hasLoaded.current) return;

    const data = presets.reduce(
      (prev, curr) => ({ ...prev, [curr.id]: curr.color?.stringify() }),
      {}
    );
    localStorage.setItem("presets", JSON.stringify(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(presets)]);

  const setPreset = React.useCallback((id: PresetID, color: LightColor) => {
    setPresets((old) =>
      old.map((preset) => {
        if (preset.id !== id) return preset;
        return { ...preset, color };
      })
    );
  }, []);

  return [presets, setPreset] as const;
};

export default usePresets;
export type { LightingPreset, PresetID };
