
export class Color {
  public static readonly BLACK = Object.freeze(new Color(0x000000));
  public static readonly WHITE = Object.freeze(new Color(0x000000));

  public static readonly RED = Object.freeze(new Color(0xff0000));
  public static readonly GREEN = Object.freeze(new Color(0x00ff00));
  public static readonly BLUE = Object.freeze(new Color(0x0000ff));
  public static readonly YELLOW = Object.freeze(new Color(0xffff00));
  public static readonly CYAN = Object.freeze(new Color(0x00ffff));
  public static readonly MAGENTA = Object.freeze(new Color(0xff00ff));

  public r: number = 0;
  public g: number = 0;
  public b: number = 0;

  constructor(int: number = 0) {
    this.r = (int >> 16) & 0xff;
    this.g = (int >> 8) & 0xff;
    this.b = int & 0xff;
  }

  toHex(): string {
    return (
      "#" +
      this.r.toString(16).padStart(2, "0") +
      this.g.toString(16).padStart(2, "0") +
      this.b.toString(16).padStart(2, "0")
    );
  }

  setFromInteger(value: number) {
    this.r = (value >> 16) & 0xff;
    this.g = (value >> 8) & 0xff;
    this.b = value & 0xff;
  }

  copyFrom(other: Color) {
    this.r = other.r;
    this.g = other.g;
    this.b = other.b;
  }

  toInt(): number {
    return (this.r << 16) + (this.g << 8) + this.b;
  }

  toRgbString(): string {
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
  }

  toRgbArrayNormalized(): [number, number, number] {
    return [this.r / 255, this.g / 255, this.b / 255];
  }

  public static frozen(...rest: ConstructorParameters<typeof Color>) {
    return Object.freeze(new Color(...rest));
  }

  public static readonly lerp = lerpColor;
}

/**
 * A linear interpolator for hexadecimal colors
 *
 * @param {Number} a
 * @param {Number} b
 * @param {Number} amount
 *
 * @example
 * lerpColor(0x000000', 0xffffff, 0.5)
 * // returns 0x7F7F7F
 *
 * @returns {Number}
 */
export function lerpColor(a: number | Color, b: number | Color, amount: number): Color {
  if (typeof a === "number") {
    a = new Color(a);
  }
  if (typeof b === "number") {
    b = new Color(b);
  }

  const result = new Color();
  result.r = Math.round(a.r + amount * (b.r - a.r));
  result.g = Math.round(a.g + amount * (b.g - a.g));
  result.b = Math.round(a.b + amount * (b.b - a.b));
  return result;
}
