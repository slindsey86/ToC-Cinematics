import { Renderer, Texture } from "@pixi/core";
import { TilingSprite } from "@pixi/sprite-tiling";
import { TemporaryTweeener } from "./TemporaryTweener";
import { EnchantmentGlobals } from "./EnchantmentGlobals";

export const TilingSpriteDimmerTemplates = {
  STRIPES: {
    textureId: "assets/images/stripes.png",
    tint: 0x060606,
    tileScale: 1.0,
  },
  SCANLINES: {
    textureId: "assets/images/scanlines.png",
    tint: 0x131313,
    tileScale: 0.456789,
  },
};

const optionDefaults = {
  tint: 0xffffff,
  tileScale: 1.0,
  maxAlpha: 0.6,
  minAlpha: 0.0,
};

// export type TilingSpriteDimmerTemplateOptions = typeof optionDefaults & { textureId: string };

export class TilingSpriteDimmer extends TilingSprite {
  private readonly tweeener;
  private readonly maxAlpha;
  private readonly minAlpha;

  constructor(options: Partial<typeof optionDefaults> & { textureId: string }) {
    super(Texture.from(options.textureId));

    options = { ...optionDefaults, ...options };

    this.tweeener = new TemporaryTweeener(this);
    this.minAlpha = options.minAlpha!;
    this.maxAlpha = options.maxAlpha!;
    this.tileScale.set(options.tileScale!);
    this.tint = options.tint!;

    this.alpha = options.minAlpha!;
    this.updateRenderable();
  }

  updateRenderable = () => {
    this.renderable = this.alpha > 0.0;
  };

  render(renderer: Renderer): void {
    if (this.renderable) {
      const { width, height } = renderer.view;
      this.width = width;
      this.height = height;
      this.tilePosition.y -= EnchantmentGlobals.timeDelta * 9;
    }

    super.render(renderer);
  }

  show() {
    return this.tweeener.to(this, {
      alpha: this.maxAlpha,
      duration: 0.5,
      overwrite: true,
      onUpdate: this.updateRenderable,
      onComplete: this.updateRenderable,
    });
  }

  hide() {
    return this.tweeener.to(this, {
      alpha: this.minAlpha,
      duration: 0.5,
      overwrite: true,
      onUpdate: this.updateRenderable,
      onComplete: this.updateRenderable,
    });
  }
}
