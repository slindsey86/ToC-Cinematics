import { GameSingletons } from "@game/app/GameSingletons";
import { Base64Goodies } from "@game/assets/base64";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";

const BLACK_PIXEL_TEXTURE = Texture.from(Base64Goodies.black);

export class LetterBoxingBars extends Container {
  private readonly context = GameSingletons.getGameContext();

  public readonly letterBoxBarVisibility: number;
  public readonly letterBoxBars: [Sprite, Sprite];

  protected tweeener = new TemporaryTweeener(this);

  constructor(private readonly viewRatio: number) {
    super();

    this.letterBoxBarVisibility = 0;
    this.letterBoxBars = [
      this.addChild(new Sprite(BLACK_PIXEL_TEXTURE)),
      this.addChild(new Sprite(BLACK_PIXEL_TEXTURE)),
    ];

    this.name = "LetterBoxingBars";
  }

  protected onEnterFrame() {
    const {
      viewSize: { width: screenViewWidth, height: screenViewHeight },
    } = this.context;

    const screenViewRatio = screenViewWidth / screenViewHeight;
    const slideshowViewRatio = this.viewRatio;

    const ratioDiff = slideshowViewRatio - screenViewRatio;

    if (ratioDiff > 0) {
      const heightShouldBe = screenViewWidth / slideshowViewRatio;
      const heightDifference = 0.5 * (screenViewHeight - heightShouldBe);

      /**
       * Show and properly resize and position the black bars
       * at the top and the bottom of the screen.
       */
      const letterBoxBarHeight = heightDifference * this.letterBoxBarVisibility;
      for (const bar of this.letterBoxBars) {
        bar.visible = true;
        bar.height = letterBoxBarHeight;
        bar.width = screenViewWidth;
      }

      const [topBar, bottomBar] = this.letterBoxBars;
      topBar.position.set(0, 0);
      bottomBar.position.set(0, screenViewHeight - letterBoxBarHeight);
    } else {
      const widthShouldBe = screenViewHeight * slideshowViewRatio;
      const widthDifference = 0.5 * (screenViewWidth - widthShouldBe);

      /**
       * Show and properly resize and position the black bars
       * at the left and the right of the screen.
       */
      const letterBoxBarWidth = widthDifference * this.letterBoxBarVisibility;
      for (const bar of this.letterBoxBars) {
        bar.visible = true;
        bar.width = letterBoxBarWidth;
        bar.height = screenViewHeight;
      }
      const [leftBar, rightBar] = this.letterBoxBars;
      leftBar.position.set(0, 0);
      rightBar.position.set(screenViewWidth - letterBoxBarWidth, 0);
    }
  }

  async playShowAnimation() {
    await this.tweeener.to(this, { letterBoxBarVisibility: 1.0, duration: 0.27 });
  }

  async playHideAnimation() {
    await this.tweeener.to(this, { letterBoxBarVisibility: 0.0, duration: 0.4 });
  }
}
