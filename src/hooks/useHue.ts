import React from "react";
import LightColor from "../color";
import CONFIG from "../config";
import {
  LightbulbDisabledIcon,
  LightbulbOffIcon,
  LightbulbOnIcon,
  LightGroupDisabledIcon,
  LightGroupOffIcon,
  LightGroupOnIcon,
} from "../icons";
import { getGroup, getGroups, getLight, getLights, setGroup, setLight } from "../remote/hue";
import { HueLight, HueLightGroup, HueState } from "./HueTypes";
import useDebounce from "./useDebounce";

const ENTITY_TYPES = ["light", "group"] as const;
type EntityType = typeof ENTITY_TYPES[number];

interface Focus {
  type: EntityType;
  id: number;
}

interface HueEntity {
  name: string;
  color: LightColor;
  on: boolean;
  reachable: boolean;
  type: EntityType;
  id: number;
}

const hueStateToColor = (state: HueState) => {
  if (state.hue) {
    return LightColor.fromHue(state.hue, state.sat, state.bri);
  } else {
    return LightColor.fromDimmableHue(state.bri);
  }
};

const hueLightToHueEntity = (light: HueLight, id: number): HueEntity => ({
  name: light.name,
  color: hueStateToColor(light.state),
  on: light.state.on,
  reachable: light.state.reachable,
  type: "light",
  id,
});

const hueGroupToHueEntity = (group: HueLightGroup, id: number, lights: HueEntity[]): HueEntity => ({
  name: group.name,
  color: hueStateToColor(group.action),
  on: group.state.any_on,
  reachable: lights
    .filter((light) => group.lights.includes(String(light.id)))
    .some((light) => light.reachable),
  type: "group",
  id,
});

const putEntity = async (entity: HueEntity) => {
  const updateFunction = entity.type === "light" ? setLight : setGroup;
  updateFunction(entity.id, entity.color, entity.on);
};

const evaluateEntity = (entity: HueEntity) => {
  let count = 0;
  if (entity.on && entity.reachable) count += 1;
  if (entity.type === "group") count += 2;
  if (entity.reachable) count += 3;
  return count;
};

const getEntityIcon = (entity: HueEntity): React.FC => {
  if (entity.type === "light") {
    if (!entity.reachable) return LightbulbDisabledIcon;
    if (!entity.on) return LightbulbOffIcon;
    return LightbulbOnIcon;
  } else {
    if (!entity.reachable) return LightGroupDisabledIcon;
    if (!entity.on) return LightGroupOffIcon;
    return LightGroupOnIcon;
  }
};

const useHue = (focus?: Focus) => {
  const [groups, setGroups] = React.useState<HueEntity[]>([]);
  const [lights, setLights] = React.useState<HueEntity[]>([]);
  const updateTimeoutID = React.useRef<number | undefined>(undefined);
  const lastLocalChange = React.useRef<Date>(new Date(0));

  const replaceEntity = React.useCallback((entity: HueEntity) => {
    const setFunction = entity.type === "group" ? setGroups : setLights;
    setFunction((old) =>
      old.map((listEntity) => {
        if (listEntity.type !== entity.type || listEntity.id !== entity.id) return listEntity;
        return entity;
      })
    );
  }, []);

  const hueEntities = [...groups, ...lights];
  const debouncedPutEntity = useDebounce(putEntity, CONFIG.hue.updateDebounce);

  // Completely rebuild entity state
  const refetchAll = React.useCallback(async () => {
    const lights = Object.entries(await getLights()).map(([id, value]) =>
      hueLightToHueEntity(value, Number(id))
    );
    const groups = Object.entries(await getGroups()).map(([id, value]) =>
      hueGroupToHueEntity(value, Number(id), lights)
    );

    setGroups(groups);
    setLights(lights);
  }, []);

  const refetchEntity = React.useCallback(
    async (entity: HueEntity) => {
      let updatedEntity: HueEntity;
      if (entity.type === "light") {
        updatedEntity = hueLightToHueEntity(await getLight(entity.id), entity.id);
      } else {
        updatedEntity = hueGroupToHueEntity(await getGroup(entity.id), entity.id, lights);
      }

      replaceEntity(updatedEntity);
    },
    [JSON.stringify(lights)]
  );

  const setEntity = React.useCallback(
    (entity: HueEntity, color: LightColor, on = true) => {
      const newEntity = { ...entity, color, on };
      debouncedPutEntity(newEntity);
      replaceEntity(newEntity);
    },
    [debouncedPutEntity, replaceEntity]
  );

  const updateFocusedEntity = (color: LightColor, on = true) => {
    if (!focus) return;
    const entity = hueEntities.find(
      (entity) => entity.type === focus.type && entity.id === focus.id
    );
    if (!entity) return;
    setEntity(entity, color, on);
  };

  // Refetch all on load
  React.useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  // Only fetches remote state if the users is not actively changing local state
  const runCycle = React.useCallback(() => {
    const now = new Date();
    if (Number(now) - Number(lastLocalChange.current) < CONFIG.hue.changingGrace) {
      // Has been changed by the user in the last Xms
      updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.changingGrace); // "Back-off" until local state settles
    } else {
      updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.refreshInterval);
      if (!focus?.id || !focus?.type) return;
      // Has NOT been changed by the user in the last Xms
      const entity = hueEntities.find(
        (entity) => entity.type === focus.type && entity.id === focus.id
      );
      if (!entity) return;

      refetchEntity(entity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.id, focus?.type, refetchEntity, JSON.stringify(hueEntities)]);

  React.useEffect(() => {
    window.clearTimeout(updateTimeoutID.current);
    updateTimeoutID.current = window.setTimeout(runCycle, CONFIG.hue.refreshInterval); // UseTimeout so interval can change
    return () => window.clearTimeout(updateTimeoutID.current);
  }, [runCycle]);

  const currentEntity = focus
    ? hueEntities.find((entity) => entity.type === focus.type && entity.id === focus.id)
    : undefined;

  const currentEntityIcon = currentEntity ? getEntityIcon(currentEntity) : undefined;

  return {
    currentEntity,
    currentEntityIcon,
    entities: hueEntities,
    refetchAll,
    refetchEntity,
    putEntity,
    getEntityIcon,
    updateFocusedEntity,
    evaluateEntity,
  };
};

export default useHue;
export type { Focus };
