import LightColor from "../../color";
import React from "react";
import useHue from "../../hooks/useHue";
import usePresets, { LightingPreset, PresetID } from "../../hooks/usePresets";
import { LightbulbOffIcon, LightbulbOnIcon, LightbulbDisabledIcon } from "../../icons";
import ColorWheel from "../ColorWheel/ColorWheel";
import LongPressButton from "../LongPressButton/LongPressButton";
import styles from "./HueApp.module.scss";
import Select from "../Select/Select";
import CONFIG from "../../config";

interface ButtonRowProps {
  presets: LightingPreset[];
  onSelectPreset: (preset: LightingPreset) => void;
  onSavePreset: (id: PresetID) => void;
}

const ButtonRow = ({ presets, onSelectPreset, onSavePreset }: ButtonRowProps) => {
  return (
    <div className={styles["presets__row"]}>
      {presets.map((preset) => (
        <LongPressButton
          className={styles["presets__button"]}
          key={preset.name}
          disabled={!preset.color}
          onShortPress={() => onSelectPreset(preset)}
          onLongPress={() => onSavePreset(preset.id)}>
          {<preset.icon />}
          {preset.name}
        </LongPressButton>
      ))}
    </div>
  );
};

interface LightbulbIconProps {
  on: boolean;
  reachable: boolean;
}

const LightbulbIcon = ({ on, reachable }: LightbulbIconProps) => {
  if (!reachable) return <LightbulbDisabledIcon />;
  if (on) {
    return <LightbulbOnIcon />;
  } else {
    return <LightbulbOffIcon />;
  }
};

const HueApp = () => {
  const [focusedLightId, setFocusedLightId] = React.useState<number | undefined>(
    CONFIG.hue.preferredLight
  );
  const hue = useHue(focusedLightId);
  const [presets, setPreset] = usePresets();

  const focusedLight = hue.lights.find((light) => light.id === focusedLightId);

  const handleNewColor = React.useCallback(
    (newColor: LightColor) => {
      if (!focusedLight?.id) return;
      hue.setLight(focusedLight.id, newColor, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedLight?.id, hue.setLight]
  );

  const handleNewPreset = React.useCallback(
    (preset: LightingPreset) => {
      if (!preset.color) return;
      handleNewColor(preset.color);
    },
    [handleNewColor]
  );

  const handleSavePreset = React.useCallback(
    (presetId: PresetID) => {
      if (!focusedLight?.color) return;
      setPreset(presetId, focusedLight.color);
    },
    [focusedLight?.color, setPreset]
  );

  const handleToggleOn = () => {
    if (!focusedLight) return;
    hue.setLight(focusedLight.id, focusedLight.color, !focusedLight.on);
  };

  return (
    <div className={styles["app"]}>
      <div
        className={styles["light"]}
        onClick={handleToggleOn}
        style={{
          "--color":
            focusedLight && focusedLight.on && focusedLight.reachable
              ? focusedLight.color.css()
              : "rgba(255,255,255,50%)",
          "--glow-opacity":
            focusedLight && focusedLight.on && focusedLight.reachable ? focusedLight.color.bri : 0,
        }}>
        <LightbulbIcon
          on={focusedLight?.on ?? false}
          reachable={focusedLight?.reachable ?? false}
        />
      </div>
      <div className={styles["details"]}>
        <div className={styles["details__top-bar"]}>
          <Select
            values={hue.lights.map((light) => ({ name: light.name, value: light.id }))}
            defaultValue={focusedLightId}
            onChange={(newTarget) => setFocusedLightId(newTarget)}
          />
        </div>
        <div className={styles["presets"]}>
          <ButtonRow
            presets={presets.slice(0, 5)}
            onSelectPreset={handleNewPreset}
            onSavePreset={handleSavePreset}
          />
          <ButtonRow
            presets={presets.slice(5)}
            onSelectPreset={handleNewPreset}
            onSavePreset={handleSavePreset}
          />
        </div>
      </div>
      <ColorWheel
        color={focusedLight ? focusedLight.color : new LightColor(0, 0, 100)}
        onColorChange={handleNewColor}
      />
    </div>
  );
};

export default HueApp;
