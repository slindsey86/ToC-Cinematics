
import { Texture } from "@pixi/core";
import { NineSlicePlane } from "@pixi/mesh-extras";
import { TilingSprite } from "@pixi/sprite-tiling";
import { context } from "../../..";
import { EnchantmentGlobals } from "../../../EnchantmentGlobals";

interface CinematicConversationBackdropOptions {
  texture: Texture;
  width: number;
  height: number;
  tileScale: number;
  skew: number;
  rotation: number;
  tileSpeedX: number;
  tileSpeedY: number;
}

export class CinematicConversationBackdrop extends TilingSprite {
  constructor({
    texture,
    width,
    height,
    tileScale,
    skew,
    rotation,
    tileSpeedX,
    tileSpeedY,
  }: CinematicConversationBackdropOptions) {
    super(texture);

    this.tileScale.set(tileScale);
    this.width = width;
    this.height = height;
    this.anchor.set(0.5);
    this.skew.set(skew, 0);
    this.rotation = rotation;

    const assets = context.assets
    const framePadding = 56;
    const frameTexture = assets.getTexture("assets/images/cinematics/story/frame.png");
    const frame = new NineSlicePlane(frameTexture, 100, 100, 100, 100);
    frame.width = width + framePadding;
    frame.height = height + framePadding;
   // frame.pivot.set(0.5 * frame.width, 0.5 * frame.height);
    //this.addChild(frame);

    Object.assign(this, {
      onEnterFrame(this: CinematicConversationBackdrop) {
        this.tilePosition.x += EnchantmentGlobals.timeDelta60 * tileSpeedX;
        this.tilePosition.y += EnchantmentGlobals.timeDelta60 * tileSpeedY;
      },
    });
  }
}
