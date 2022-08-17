import { FontFamily } from "./FontFamily";
import { Texture } from "@pixi/core";
import { DisplayObject } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Text, ITextStyle } from "@pixi/text";
import { AssetsManager } from "./assets-manager";

const DEFAULT_TEXT_STYLE: Partial<ITextStyle> = {
  fontFamily: FontFamily.Default,
  fontSize: 32,
  lineHeight: 40,
  fill: "#FFFFFF",
};

export class SimpleObjectsFactory {
  constructor(public readonly assets: AssetsManager) {}

  createSprite(texture?: string | Texture): Sprite;
  createSprite<T extends Partial<Sprite> = {}>(texture?: string | Texture, modifiers?: T): Sprite & T;
  createSprite<T extends Partial<Sprite> = {}>(texture?: string | Texture, modifiers?: T): Sprite & T {
    if (typeof texture === "string") {
      texture = this.assets.getTexture(texture) || Texture.from(texture);
    }

    const sprite = new Sprite(texture);
    if (modifiers) {
      return Object.assign(sprite, modifiers);
    }
    return sprite as Sprite & T;
  }

  createText(text?: string, style?: Partial<ITextStyle>): Text;
  createText<T extends Partial<Sprite> = {}>(text?: string, style?: Partial<ITextStyle>, modifiers?: T): Text & T;
  createText<T extends Partial<Sprite> = {}>(text?: string, style?: Partial<ITextStyle>, modifiers?: T): Text & T {
    const sprite = new Text(text || "", { ...DEFAULT_TEXT_STYLE, ...style });
    if (modifiers) {
      return Object.assign(sprite, modifiers);
    }
    return sprite as Text & T;
  }
}

function modifyDisplayObjectProperties<T extends DisplayObject | Sprite>(target: T, modifiers: Partial<T>) {
  return Object.assign(target, modifiers);
}
