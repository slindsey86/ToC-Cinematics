import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { context } from "../../..";
import { TemporaryTweeener } from "../../../TemporaryTweener";




export class LetterBoxingBars extends Container {
  private readonly context = context

  public readonly letterBoxBarVisibility: number;
  public readonly letterBoxBars: [];

  protected tweeener = new TemporaryTweeener(this);

  constructor(private readonly viewRatio: number) {
    super();

    this.letterBoxBarVisibility = 0;
    this.letterBoxBars = [

    ];

  }

  protected onEnterFrame() {
    const {
      viewSize: { width: screenViewWidth, height: screenViewHeight },
    } = this.context;

    const screenViewRatio = screenViewWidth / screenViewHeight;
    const slideshowViewRatio = this.viewRatio;

    const ratioDiff = slideshowViewRatio - screenViewRatio;

   /* if (ratioDiff > 0) {
      const heightShouldBe = screenViewWidth / slideshowViewRatio;
      const heightDifference = 0.5 * (screenViewHeight - heightShouldBe);

    
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

      const letterBoxBarWidth = widthDifference * this.letterBoxBarVisibility;
      for (const bar of this.letterBoxBars) {
        bar.visible = true;
        bar.width = letterBoxBarWidth;
        bar.height = screenViewHeight;
      }
      const [leftBar, rightBar] = this.letterBoxBars;
      leftBar.position.set(0, 0);
      rightBar.position.set(screenViewWidth - letterBoxBarWidth, 0);
    }*/
  }

  async playShowAnimation() {
    await this.tweeener.to(this, { letterBoxBarVisibility: 1.0, duration: 0.27 });
  }

  async playHideAnimation() {
    await this.tweeener.to(this, { letterBoxBarVisibility: 0.0, duration: 0.4 });
  }
}
