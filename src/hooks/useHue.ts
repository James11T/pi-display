import React from "react";
import LightColor from "../color";
import CONFIG from "../config";
import { HueColorLight } from "./HueTypes";
import useDebounce from "./useDebounce";

const { VITE_BRIDGE_URL, VITE_BRIDGE_USERNAME } = import.meta.env;

const baseUrl = `${VITE_BRIDGE_URL}api/${VITE_BRIDGE_USERNAME}`;

interface Light {
  name: string;
  color: LightColor;
  on: boolean;
  reachable: boolean;
  id: number;
}

const hueLightToLight = (light: HueColorLight, id: number) => ({
  name: light.name,
  color: LightColor.fromHue(light.state.hue, light.state.sat, light.state.bri),
  on: light.state.on,
  reachable: light.state.reachable,
  id,
});

const useHue = (focusedLight?: number) => {
  const [lights, setLights] = React.useState<Light[]>([]);
  const updateTimeoutID = React.useRef<number | undefined>(undefined);
  const lastLocalChange = React.useRef<Date>(new Date(0));

  // Fetch all light states from Hue API
  const getLights = async () => {
    const res = await fetch(`${baseUrl}/lights`);
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    const data: Record<string, HueColorLight> = await res.json();
    return data;
  };

  // Fetch a single light state from Hue API
  const getLight = React.useCallback(async (id: number) => {
    const res = await fetch(`${baseUrl}/lights/${id}`);
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    const data: HueColorLight = await res.json();
    return data;
  }, []);

  // Set a single remote light state with Hue API
  const dispatchSetLight = useDebounce(
    React.useCallback(
      async (id: number, color: LightColor, on = true) =>
        await fetch(`${baseUrl}/lights/${id}/state`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            on,
            ...color.forHue(),
          }),
        }),
      []
    ),
    CONFIG.hue.updateDebounce
  );

  // Set the local state for a light
  // Calls debounced API fetch
  const setLight = React.useCallback(
    async (id: number, color: LightColor, on = true) => {
      lastLocalChange.current = new Date();
      setLights((old) =>
        old.map((light) => {
          if (light.id !== id) return light;
          return { ...light, color, on };
        })
      );

      dispatchSetLight(id, color, on);
    },
    [dispatchSetLight]
  );

  // Fetch and store the current state of a single light
  const updateLight = React.useCallback(
    async (id: number) => {
      const updatedLight = await getLight(id);

      setLights((old) =>
        old.map((light) => {
          if (light.id !== id) return light;
          return hueLightToLight(updatedLight, id);
        })
      );
    },
    [getLight]
  );

  // Fetch and store all lights
  const updateLights = React.useCallback(async () => {
    const lights = await getLights();

    setLights(
      Object.keys(lights).map((lightId) => hueLightToLight(lights[lightId], Number(lightId)))
    );
  }, []);

  // Run to update light states
  // Only fetches remote state if the users is not actively changing local state
  const runCycle = React.useCallback(() => {
    const now = new Date();
    if (Number(now) - Number(lastLocalChange.current) < CONFIG.hue.changingGrace) {
      // Has been changed by the user in the last Xms
      updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.changingGrace); // "Back-off" until local state settles
    } else {
      // Has NOT been changed by the user in the last Xms
      focusedLight && updateLight(focusedLight);
      updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.refreshInterval);
    }
  }, [focusedLight, updateLight]);

  React.useEffect(() => {
    window.clearTimeout(updateTimeoutID.current);
    updateLights(); // Update all lights
    updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.refreshInterval); // UseTimeout so interval can change
    return () => window.clearTimeout(updateTimeoutID.current);
  }, [runCycle, updateLights]);

  return { lights, setLight };
};

export default useHue;
