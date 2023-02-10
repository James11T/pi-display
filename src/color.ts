const HUE_HUE_RANGE = 65535;
const HUE_SAT_RANGE = 254;
const HUE_BRI_RANGE = 254;

const LOCAL_HUE_RANGE = 360;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

class LightColor {
  hue: number; // 0 to 360
  sat: number; // 0 to 1
  bri: number; // 0 to 1

  constructor(_hue: number, _sat: number, _bri: number) {
    this.hue = _hue;
    this.sat = _sat;
    this.bri = _bri;
  }

  forHue() {
    return {
      hue: Math.round((this.hue / 360) * HUE_HUE_RANGE),
      sat: Math.round(this.sat * HUE_SAT_RANGE),
      bri: Math.round(this.bri * HUE_BRI_RANGE),
    };
  }

  stringify() {
    return JSON.stringify({ hue: this.hue, sat: this.sat, bri: this.bri });
  }

  css() {
    return `hsl(${this.hue}deg, ${Math.round(this.sat * 100)}%, 50%)`;
  }

  normalise() {
    this.hue = clamp(this.hue, 0, 360);
    this.sat = clamp(this.sat, 0, 1);
    this.bri = clamp(this.bri, 0, 1);
    return this;
  }

  static parse(input: string) {
    const data = JSON.parse(input);
    return new LightColor(data.hue, data.sat, data.bri);
  }

  static fromHue(hue: number, sat: number, bri: number) {
    return new LightColor(
      (hue / HUE_HUE_RANGE) * LOCAL_HUE_RANGE,
      sat / HUE_SAT_RANGE,
      bri / HUE_BRI_RANGE
    );
  }

  static fromDimmableHue(bri: number) {
    return LightColor.fromHue(0, 24.5, bri);
  }
}

export default LightColor;
