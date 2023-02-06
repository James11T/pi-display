import React from "react";
import LightColor from "../color";
import useDebounce from "./useDebounce";

const { VITE_BRIDGE_URL, VITE_BRIDGE_USERNAME } = import.meta.env;

const baseUrl = `${VITE_BRIDGE_URL}api/${VITE_BRIDGE_USERNAME}`;

interface HueLight {
  state: {
    on: boolean;
    bri: number;
    hue: number;
    sat: number;
    effect: string;
    xy: [number, number];
    ct: number;
    alert: string;
    colormode: string;
    mode: string;
    reachable: boolean;
  };
  swupdate: {
    state: string;
    lastinstall: string;
  };
  type: string;
  name: string;
  modelid: string;
  manufacturername: string;
  productname: string;
  capabilities: {
    certified: boolean;
    control: {
      mindimlevel: number;
      maxlumen: number;
      colorgamuttype: string;
      colorgamut: [[number, number], [number, number], [number, number]];
      ct: {
        min: number;
        max: number;
      };
    };
    streaming: {
      renderer: boolean;
      proxy: boolean;
    };
  };
  config: {
    archetype: string;
    function: string;
    direction: string;
    startup: {
      mode: string;
      configured: boolean;
    };
  };
  uniqueid: string;
  swversion: string;
  swconfigid: string;
  productid: string;
}

interface Light {
  name: string;
  color: LightColor;
  on: boolean;
  reachable: boolean;
  id: string;
}

const hueLightToLight = (light: HueLight, id: string) => ({
  name: light.name,
  color: LightColor.fromHue(light.state.hue, light.state.sat, light.state.bri),
  on: light.state.on,
  reachable: light.state.reachable,
  id,
});

const useHue = (focusedLight?: string) => {
  const [lights, setLights] = React.useState<Light[]>([]);
  const updateIntervalId = React.useRef<number | undefined>(undefined);

  const getLights = async () => {
    const res = await fetch(`${baseUrl}/lights`);
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    const data: Record<string, HueLight> = await res.json();
    return data;
  };

  const getLight = React.useCallback(async (id: string) => {
    const res = await fetch(`${baseUrl}/lights/${id}`);
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    const data: HueLight = await res.json();
    return data;
  }, []);

  const setLight = React.useCallback(async (id: string, color: LightColor, on = true) => {
    setLights((old) =>
      old.map((light) => {
        if (light.id !== id) return light;
        return { ...light, color, on };
      })
    );

    const res = await fetch(`${baseUrl}/lights/${id}/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        on,
        ...color.forHue(),
      }),
    });
    return await res.json();
  }, []);

  const updateLight = async (id: string) => {
    const updatedLight = await getLight(id);

    setLights((old) =>
      old.map((light) => {
        if (light.id !== id) return light;
        return hueLightToLight(updatedLight, id);
      })
    );
  };

  const updateLights = async () => {
    const lights = await getLights();

    setLights(Object.keys(lights).map((lightId) => hueLightToLight(lights[lightId], lightId)));
  };

  React.useEffect(() => {
    updateLights();
    updateIntervalId.current = window.setInterval(() => {
      focusedLight && updateLight(focusedLight);
    }, 5_000);
    return () => window.clearInterval(updateIntervalId.current);
  }, [focusedLight]);

  const debouncedGetLight = useDebounce(getLight, 500);
  const debouncedSetLight = useDebounce(setLight, 500);

  return { lights, getLight: debouncedGetLight, setLight: debouncedSetLight };
};

export default useHue;
