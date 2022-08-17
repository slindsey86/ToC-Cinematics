import { GameSingletons } from "@game/app/GameSingletons";
import { tweenTintProperty } from "@game/asorted/animations/tweenTintProperty";
import { NPCEncounterCinematicSlideUserChoiceOptionData } from "@game/cinematics/types/NPCEncounterCinematicData";
import { FontFamily } from "@game/constants/FontFamily";
import { ThemeColors } from "@game/constants/ThemeColors";
import { Container } from "@pixi/display";
import { Point } from "@pixi/math";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";
import { buttonizeDisplayObject } from "@sdk-pixi/ui-helpers/buttonizeDisplayObject";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { lerp } from "@sdk/utils/math";

const bubblesLinePointA = new Point(950, -285);
const bubblesLinePointB = new Point(730, 530);

/**
 * @param choice List of available choices for the user to pick from
 * @param container Add the choice selection component to this container
 */
export function presentUserDialogueChoiceOptions(
  options: NPCEncounterCinematicSlideUserChoiceOptionData[],
  container: Container
) {
  return new Promise<NPCEncounterCinematicSlideUserChoiceOptionData>(resolve => {
    const bubbles = new Array<UserChoiceBubble>();

    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      const bubble = new UserChoiceBubble(option.text);
      bubble.position.x = lerp(bubblesLinePointA.x, bubblesLinePointB.x, (i + 0.75) / options.length);
      bubble.position.y = lerp(bubblesLinePointA.y, bubblesLinePointB.y, (i + 0.75) / options.length);
      bubble.scale.set(0.5);
      bubble.onClick = () => resolve(option);
      bubble.setSeen(!!option.seen);

      container.addChild(bubble);
      bubbles.push(bubble);
    }

    const tweeener = new TemporaryTweeener(container);
    tweeener.from(bubbles, { pixi: { scale: 0 }, duration: 0.22, ease: "power.out", stagger: 0.25 });
  });
}

class UserChoiceBubble extends Container {
  private readonly assets = GameSingletons.getResources();

  private readonly bubbleText;
  private readonly bubble;

  public onClick?: () => unknown;

  constructor(text: string) {
    super();

    const texture = this.assets.getTexture("cinematics/story/speech-box-player.png");

    this.bubble = new Sprite(texture);
    this.addChild(this.bubble);

    this.bubbleText = new Text(text, {
      fontFamily: FontFamily.Default,
      fontSize: 72,
      fill: 0xffffff,
      align: "center",
      stroke: "#080808",
      strokeThickness: 4,
      dropShadow: true,
      dropShadowAngle: 1.57079632679,
      dropShadowColor: 0x080808,
      dropShadowDistance: 8,
      dropShadowAlpha: 0.5,
      dropShadowBlur: 24,
    });
    this.bubbleText.updateText(false);

    const textScale = Math.min(1.5, (0.75 * texture.width) / this.bubbleText.width);
    this.bubbleText.scale.set(textScale);
    this.bubbleText.anchor.set(0.5, 0.5);
    this.bubbleText.position.set(0.48 * this.bubble.width, 0.43 * this.bubble.height);

    this.bubble.addChild(this.bubbleText);
    this.bubble.pivot.set(texture.width * 0.99, texture.height * 0.99);

    const tweeener = new TemporaryTweeener(this);

    buttonizeDisplayObject(this.bubble, () => this.onClick?.());

    this.bubble
      .on("pointerover", () => {
        tweeener.to(this.bubble, { pixi: { scale: 1.8 }, duration: 0.25, ease: "back.out", overwrite: true });
        tweenTintProperty(this.bubbleText, ThemeColors.HIGHLIGHT_COLOR_LIGHT, 0.2, tweeener);
      })
      .on("pointerdown", () => {
        tweeener.to(this.bubble, { pixi: { scale: 1.75 }, duration: 0.05, ease: "power3.out", overwrite: true });
        tweenTintProperty(this.bubbleText, ThemeColors.HIGHLIGHT_COLOR_LIGHT, 0.1, tweeener);
      })
      .on("pointerout", () => {
        tweeener.to(this.bubble, { pixi: { scale: 1.0 }, duration: 0.4, ease: "back.out", overwrite: true });
        tweenTintProperty(this.bubbleText, ThemeColors.NORMAL_COLOR, 0.5, tweeener);
      })
      .on("pointerup", () => {
        tweeener.to(this.bubble, { pixi: { scale: 1.0 }, duration: 0.4, ease: "back.out", overwrite: true });
        tweenTintProperty(this.bubbleText, ThemeColors.NORMAL_COLOR, 0.5, tweeener);
      });
  }

  setSeen(seen: boolean) {
    this.bubble.interactive = !seen;
    this.bubble.buttonMode = !seen;
    this.bubble.tint = !seen ? 0xffffff : 0x606060;
    this.bubbleText.tint = !seen ? 0xffffff : 0x909090;
  }
}
