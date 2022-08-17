import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";

export class NPCEncounterCinematicSpeechBubble extends Container {
  private bubbleSprite: Sprite;
  private bubbleText: Text;

  constructor(bubbleSprite: Sprite, bubbleText: Text) {
    super();

    this.bubbleSprite = bubbleSprite;
    this.bubbleText = bubbleText;

    this.addChild(this.bubbleSprite);
    this.addChild(this.bubbleText);
  }

  remove() {
    this.bubbleSprite.destroy();
    this.bubbleText.destroy();
  }
}
