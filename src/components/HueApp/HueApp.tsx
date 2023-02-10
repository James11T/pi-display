import LightColor from "../../color";
import React from "react";
import useHue, { Focus } from "../../hooks/useHue";
import usePresets, { LightingPreset, PresetID } from "../../hooks/usePresets";
import { LightbulbUnknownIcon } from "../../icons";
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

const HueApp = () => {
  const [focus, setFocus] = React.useState<Focus | undefined>(CONFIG.hue.defaultEntity);
  const hue = useHue(focus);
  const [presets, setPreset] = usePresets();

  const handleNewColor = React.useCallback(
    (newColor: LightColor) => {
      hue.updateFocusedEntity(newColor, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hue.updateFocusedEntity]
  );

  const handleNewPreset = React.useCallback(
    (preset: LightingPreset) => {
      if (!preset.color) return;
      handleNewColor(preset.color);
    },
    [handleNewColor]
  );

  const handleSavePreset = React.useCallback(
    (presetId: PresetID, color: LightColor) => {
      setPreset(presetId, color);
    },
    [setPreset]
  );

  const handleToggleOn = () => {
    if (!hue.currentEntity) return;
    hue.updateFocusedEntity(hue.currentEntity.color, !hue.currentEntity.on);
  };

  const selectables = hue.entities
    .sort((a, b) => hue.evaluateEntity(b) - hue.evaluateEntity(a))
    .map((entity) => ({
      name: entity.name,
      value: {
        id: entity.id,
        type: entity.type,
      },
      disabled: !entity.reachable,
      icon: hue.getEntityIcon(entity),
    }));

  return (
    <div className={styles["app"]}>
      <div
        className={styles["light"]}
        onClick={handleToggleOn}
        style={{
          "--color":
            hue.currentEntity && hue.currentEntity.on && hue.currentEntity.reachable
              ? hue.currentEntity.color.css()
              : "rgba(255,255,255,50%)",
          "--glow-opacity":
            hue.currentEntity && hue.currentEntity.on && hue.currentEntity.reachable
              ? hue.currentEntity.color.bri
              : 0,
        }}>
        {hue.currentEntityIcon ? <hue.currentEntityIcon /> : <LightbulbUnknownIcon />}
      </div>
      <div className={styles["details"]}>
        <div className={styles["details__top-bar"]}>
          <Select
            values={selectables}
            value={
              focus
                ? selectables.find(
                    (selectable) =>
                      selectable.value.type === focus?.type && selectable.value.id === focus?.id
                  )?.value
                : undefined
            }
            onChange={(newFocus) => setFocus(newFocus as Focus)} //! TODO: Support groups
          />
        </div>
        <div className={styles["presets"]}>
          <ButtonRow
            presets={presets.slice(0, 5)}
            onSelectPreset={handleNewPreset}
            onSavePreset={(presetId: string) =>
              hue.currentEntity && handleSavePreset(presetId, hue.currentEntity.color)
            }
          />
          <ButtonRow
            presets={presets.slice(5)}
            onSelectPreset={handleNewPreset}
            onSavePreset={(presetId: string) =>
              hue.currentEntity && handleSavePreset(presetId, hue.currentEntity.color)
            }
          />
        </div>
      </div>
      <ColorWheel
        color={hue.currentEntity ? hue.currentEntity.color : new LightColor(0, 0, 100)}
        onColorChange={handleNewColor}
      />
    </div>
  );
};

export default HueApp;
