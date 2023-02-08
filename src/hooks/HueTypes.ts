interface HueStateDimmable {
  on: boolean;
  bri: number;
  alert: string;
}

interface HueStateColor extends HueStateDimmable {
  hue: number;
  sat: number;
  effect: string;
  xy: [number, number];
  ct: number;
  colormode: string;
}

type HueState = HueStateDimmable | HueStateColor;

interface HueBaseLight<T = HueState> {
  state: T & {
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

interface HueDimmableLight extends HueBaseLight<HueStateDimmable> {
  type: "Dimmable light";
  capabilities: {
    certified: boolean;
    control: {
      mindimlevel: number;
      maxlumen: number;
    };
    streaming: {
      renderer: boolean;
      proxy: boolean;
    };
  };
}

interface HueColorLight extends HueBaseLight<HueStateColor> {
  type: "Extended color light";
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
}

type HueLight = HueDimmableLight | HueColorLight;

interface HueLightGroupBase<T = HueState> {
  name: string;
  lights: string[];
  sensors: unknown[];
  type: string;
  state: {
    all_on: boolean;
    any_on: boolean;
  };
  recycle: boolean;
  class: string;
  action: T;
}

type HueDimmableLightGroup = HueLightGroupBase<HueStateDimmable>;
type HueColorLightGroup = HueLightGroupBase<HueStateColor>;

type HueLightGroup = HueDimmableLightGroup | HueColorLightGroup;

export type {
  HueColorLight,
  HueDimmableLight,
  HueLight,
  HueDimmableLightGroup,
  HueColorLightGroup,
  HueLightGroup,
};
