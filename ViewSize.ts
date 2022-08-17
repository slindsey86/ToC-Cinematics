export class ViewSize {
  public width: number = 0;
  public height: number = 0;

  get centerX() {
    return this.width / 2;
  }

  get centerY() {
    return this.height / 2;
  }

  get vmin() {
    return Math.min(this.height, this.width);
  }

  get vmax() {
    return Math.max(this.height, this.width);
  }

  get ratio() {
    return this.width / this.height;
  }
}
