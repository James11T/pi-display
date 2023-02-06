import LightColor from "../../color";
import React from "react";
import useHue from "../../hooks/useHue";
import usePresets, { LightingPreset, PresetID } from "../../hooks/usePresets";
import { LightbulbOffIcon, LightbulbOnIcon } from "../../icons";
import ColorWheel from "../ColorWheel/ColorWheel";
import LongPressButton from "../LongPressButton/LongPressButton";
import styles from "./HueApp.module.scss";

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

const HueApp = () => {
  const [focusedLightId, setFocusedLightId] = React.useState<string | undefined>("2");
  const hue = useHue(focusedLightId);
  const [presets, setPreset] = usePresets();

  const focusedLight = hue.lights.find((light) => light.id === focusedLightId);

  const handleNewColor = (newColor: LightColor) => {
    if (!focusedLight) return;
    hue.setLight(focusedLight.id, newColor, true);
  };

  const handleNewPreset = (preset: LightingPreset) => {
    if (!preset.color) return;
    handleNewColor(preset.color);
  };

  const handleSavePreset = (presetId: PresetID) => {
    if (!focusedLight) return;
    setPreset(presetId, focusedLight.color);
  };

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
            focusedLight && focusedLight.on ? focusedLight.color.css() : "rgba(255,255,255,50%)",
          "--glow-opacity": focusedLight && focusedLight.on ? focusedLight.color.bri : 0,
        }}>
        {focusedLight && focusedLight.on ? <LightbulbOnIcon /> : <LightbulbOffIcon />}
      </div>
      <div className={styles["details"]}>
        <div className={styles["details__top-bar"]}>
          <h1>{focusedLight?.name ?? ""}</h1>
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
