import * as API from "./api";
import { HueLight, HueLightGroup } from "../hooks/HueTypes";
import LightColor from "../color";

const { VITE_BRIDGE_URL, VITE_BRIDGE_USERNAME } = import.meta.env;
const baseUrl = `${VITE_BRIDGE_URL}api/${VITE_BRIDGE_USERNAME}`;

const getLights = async () => {
  const res = await API.get<Record<string, HueLight>>(`${baseUrl}/lights`);
  return res;
};

// Fetch a single light state from Hue API
const getLight = async (id: number) => {
  const res = await API.get<HueLight>(`${baseUrl}/lights/${id}`);
  return res;
};

// Set a single remote light state with Hue API
const setLight = async (id: number, color: LightColor, on = true) =>
  await API.put(`${baseUrl}/lights/${id}/state`, {
    contentType: "json",
    body: {
      on,
      ...color.forHue(),
    },
  });

// Fetch all groups from Hue API
const getGroups = async () => {
  const res = await API.get<Record<string, HueLightGroup>>(`${baseUrl}/groups`);
  return res;
};

// Fetch a specific group from Hue API
const getGroup = async (id: number) => {
  const res = await API.get<HueLightGroup>(`${baseUrl}/groups/${id}`);
  return res;
};

// Set a group remote light state with Hue API
const setGroup = async (id: number, color: LightColor, on = true) =>
  await API.put(`${baseUrl}/groups/${id}/action`, {
    contentType: "json",
    body: {
      on,
      ...color.forHue(),
    },
  });

export { getLight, getLights, setLight, getGroups, getGroup, setGroup };
