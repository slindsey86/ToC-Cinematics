import { GameContext } from "../../boot";
import { EnchantedContainer } from "../../enchanted-classes";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Rectangle } from "@pixi/math";
import { Sprite } from "@pixi/sprite";
import { AnimatedSprite } from "@pixi/sprite-animated";
import { Text } from "@pixi/text";
import { TextureCache } from "@pixi/utils";
import { deepCopy } from "../../objects";
import { TemporaryTweeener } from "../../TemporaryTweener";
import { range } from "../../range";
import { ReadonlyObjectDeep } from "type-fest/source/readonly-deep";
import { LetterBoxingBars } from "./components/LetterBoxingBars";
import { NPCEncounterCinematicSpeechBubble } from "./NPCEncounterCinematicSpeechBubble";
import type {
  NPCEncounterCinematicCharacterNameplateData,
  NPCEncounterCinematicData,
  NPCEncounterCinematicSlideCharacterPoseData,
  NPCEncounterCinematicSlideData,
  NPCEncounterCinematicSlideSpeechBubbleData,
  NPCEncounterCinematicSlideUserChoiceOptionData,
  NPCEncounterCinematicUserChoicesDictionary,
} from "./types/NPCEncounterCinematicData";
import { DynamicChoiceActionsService } from "./utils/dynamicChoiceActionFunctions";
import { DynamicSpecialEffectsService } from "./utils/dynamicSpecialEffectFunctions";
import { DynamicStoryTextService } from "./utils/dynamicStoryContentFunctions";
import { context } from "../..";

import { FontFamily } from "../../FontFamily";
import type { ITextStyle } from "@pixi/text";

export const DefaultTextStyle: Partial<ITextStyle> = {
  fontFamily: FontFamily.Default,
  fontSize: 26,
  lineHeight: 32,
  fill: 0xffffff,
};


const getThingPresetData = <T>(thingData: T & { preset?: string }, thingPresets?: Partial<Record<string, T>>) => {
  const presetKey = thingData?.preset;
  if (presetKey == undefined) {
    return undefined;
  }
  if (thingPresets == undefined) {
    return undefined;
  }
  if (thingPresets[presetKey] == undefined) {
    return undefined;
  }
  return thingPresets[presetKey];
};

export abstract class NPCEncounterCinematic extends EnchantedContainer {
  protected readonly context: GameContext = context;
  protected readonly tweeener = new TemporaryTweeener(this);

  public readonly slideshowViewBounds: Rectangle;
  public readonly slideshowViewContainer: Container;

  public readonly letterBox: LetterBoxingBars;

  protected textures: null | Record<string, Texture> = null;
  protected texturesStartedLoading: boolean = false;
  protected texturesError: Error | null = null;

  public doTheUserChoiceThing?: (
    choices: NPCEncounterCinematicSlideUserChoiceOptionData[],
    container: Container
  ) => Promise<NPCEncounterCinematicSlideUserChoiceOptionData>;

  public userChoicesDictionary: NPCEncounterCinematicUserChoicesDictionary | null = null;
  public dynamicStoryTextService: DynamicStoryTextService | null = null;
  public dynamicChoiceActionsService: DynamicChoiceActionsService | null = null;
  public dynamicSpecialEffectsService: DynamicSpecialEffectsService | null = null;

  constructor(
    protected readonly data: NPCEncounterCinematicData,
    protected readonly claimSpecialRewards: () => Promise<unknown>,
  ) {
    super();

    this.slideshowViewBounds = new Rectangle(0, 0, 1920, 1080);
    this.slideshowViewContainer = this.addChild(new Container());

    this.letterBox = new LetterBoxingBars(this.slideshowViewBounds.width / this.slideshowViewBounds.height);
    this.addChild(this.letterBox);

    this.onEnterFrame.add(this.updatePositioning.bind(this));
  }

  public async loadAssets() {
    console.log("Loading NPCEncounterCinematic assets...");

    try {
      if (this.texturesStartedLoading) {
        throw new Error("Already loading textures!");
      }
      this.texturesStartedLoading = true;
      await this.context.assets.load(this.data.assets);
      this.textures = Object.assign({}, this.textures, this.context.assets.textures, TextureCache);
      return;
    } catch (error) {
      this.texturesError = error as Error;
    }
  }

  protected async playIntroAnimation() {
    function playAnimatedSpriteOnce(sprite: AnimatedSprite, mods?: Partial<AnimatedSprite>) {
      return new Promise<void>((resolve, reject) => {
        try {
          mods && Object.assign(sprite, mods);
          sprite.onComplete = resolve;
          sprite.loop = false;
          sprite.play();
        } catch (error) {
          reject(error);
        }
      });
    }

    const introAnimation = new AnimatedSprite(
      range(91).map(i => Texture.from(`assets/images/cinematics/otto-intro.basis-${i + 1}`)),
      true
    );
    this.slideshowViewContainer.addChild(introAnimation);
    await Promise.all([
      this.tweeener.from(introAnimation, { alpha: 0.0, duration: 0.4 }),
      playAnimatedSpriteOnce(introAnimation, {
        width: 1920,
        height: 1080,
        animationSpeed: 0.75,
      }),
    ]);
    this.tweeener.to(introAnimation, {
      alpha: 0.0,
      duration: 0.4,
      onComplete: () => introAnimation.destroy(),
    });
  }

  protected async playStorySlides(
    data: NPCEncounterCinematicData,
    onLastSlide?: (choicesMade: NPCEncounterCinematicUserChoicesDictionary) => Promise<unknown>,
    existingChoices: NPCEncounterCinematicUserChoicesDictionary = this.userChoicesDictionary || {}
  ) {
    const {
      speechBubbleTexturePrefix,
      characterTexturePrefix,
      slides: slidesData,
      characterNameplate: characterNameplateData,
      advanceOnlyAfterClick = true,
    } = deepCopy(data);
    const textures = this.textures;

    if (!textures) {
      throw new Error("Textures not loaded");
    }

    const { simpleFactory, ticker } = this.context;

    let characterNameplate: Sprite | null = null;
    let character: Sprite | null = null;
    const bubbles: NPCEncounterCinematicSpeechBubble[] = [];

    const updateCharacterNameplate = async (
      characterNameplateData: NPCEncounterCinematicCharacterNameplateData | null
    ) => {
      /**
       * If both the data is null and the character name plate already doesn't exists,
       * then we don't need to do anything.
       */
      if (characterNameplate == null && characterNameplateData == null) {
        return;
      }

      /**
       * If the character name plate already exists, and has the same texture,
       * then we don't need to do anything.
       */
      if (
        characterNameplate &&
        characterNameplateData &&
        characterNameplate.texture == textures[characterNameplateData.textureId]
      ) {
        return;
      }

      /**
       * Else, if the character name plate already exists, but has a different
       * texture, then we need to play it out and destroy it.
       */
      if (characterNameplate) {
        /**
         * Save another reference to the sprite, so that we can destroy it later.
         * If we don't do this, and do just `characterNameplate.destroy()` instead when onComplete is called,
         * we'd be destroying the new sprite created down below.
         */
        const oldCharacterNameplate = characterNameplate;
        characterNameplate = null;

        await this.tweeener.to(oldCharacterNameplate, {
          alpha: 0,
          duration: 0.5,
          onComplete: () => oldCharacterNameplate.destroy(),
        });
      }

      /**
       * If the data parameter is null, then assume we don't want to create another
       * character name plate and end here.
       */
      if (characterNameplateData == null) {
        return;
      }

      /**
       * If the character name plate doesn't exist, (either because we destroyed it,
       * or because it wasn't there to begin with), then we need to create it.
       */
      if (characterNameplate == null) {
        // create character name plate

        const characterNameplateTexture = textures[characterNameplateData.textureId];
        characterNameplate = new Sprite(characterNameplateTexture);
        characterNameplate.position.copyFrom(characterNameplateData);
        characterNameplate.scale.set(characterNameplateData.scale);
        characterNameplate.angle = characterNameplateData.angle || 0;
        this.slideshowViewContainer.addChild(characterNameplate);
        this.tweeener.from(characterNameplate, {
          alpha: 0,
          duration: 0.7,
          delay: 0.1,
        });
      } else {
        // keep name on top of character
        this.slideshowViewContainer.setChildIndex(characterNameplate, this.slideshowViewContainer.children.length - 1);
      }
    };

    const fallbackCharacterPoseData: NPCEncounterCinematicSlideCharacterPoseData = {
      textureSuffix: "",
      x: 0,
      y: 0,
      scale: 0.25,
      flipped: false,
    };
    let currentCharacterPoseData = null as NPCEncounterCinematicSlideCharacterPoseData | null;
    const compareCharacterPoses = (
      a: NPCEncounterCinematicSlideCharacterPoseData | null,
      b: NPCEncounterCinematicSlideCharacterPoseData | null
    ) => {
      /**
       * If both the character pose data is null and the character already doesn't exists,
       * then we don't need to do anything.
       */
      if (a == null && b == null) {
        return true;
      }

      if (a != null && b != null) {
        return (
          a.textureSuffix === b.textureSuffix &&
          a.x === b.x &&
          a.y === b.y &&
          a.scale === b.scale &&
          a.flipped === b.flipped
        );
      }

      return false;
    };
    const updateCharacterPose = async (
      characterPoseData: (Partial<NPCEncounterCinematicSlideCharacterPoseData> & { preset?: string }) | null
    ) => {
      const previousCharacterPoseData = currentCharacterPoseData;

      const defaultCharacterPoseData = data.characterPosePresets?.default;
      const presetCharacterPoseData =
        characterPoseData && getThingPresetData(characterPoseData, data.characterPosePresets);
      currentCharacterPoseData = characterPoseData && {
        ...fallbackCharacterPoseData,
        ...defaultCharacterPoseData,
        ...presetCharacterPoseData,
        ...characterPoseData,
      };

      /**
       * If both the character pose data is null and the character already doesn't exists,
       * then we don't need to do anything.
       *
       * If the character already exists, and has the same pose data,
       * then we also don't need to do anything.
       */
      if (compareCharacterPoses(currentCharacterPoseData, previousCharacterPoseData)) {
        return;
      }

      /**
       * We'll need to know this a few lines down.
       */
      const characterAlreadyExistedInSomeOtherPose = character != null;

      /**
       * Else, if the character already exists, but has a different pose texture,
       * then we need to play it out and destroy it.
       */
      if (character) {
        /**
         * Save another reference to the sprite, so that we can destroy it later.
         * If we don't do this, and do just `character.destroy()` instead when onComplete is called,
         * we'd be destroying the new sprite created down below.
         */
        const oldCharacter = character;
        character = null;

        this.tweeener.to(oldCharacter, {
          alpha: 0,
          duration: 0.28,
          onComplete: () => oldCharacter.destroy(),
        });
      }

      /**
       * If the data parameter is null, then assume we don't want to create another character sprite and end here.
       */
      if (currentCharacterPoseData == null) {
        return;
      }

      /**
       * If the character sprite doesn't exist, (either because we destroyed it,
       * or because it wasn't there to begin with), then we need to create it.
       */
      if (character == null) {
        const characterTextureId = characterTexturePrefix + currentCharacterPoseData.textureSuffix;
        const characterTexture = textures[characterTextureId];

        character = new Sprite(characterTexture);
        character.position.copyFrom(currentCharacterPoseData);
        character.scale.set(currentCharacterPoseData.scale * 5.0);

        if (currentCharacterPoseData.flipped) {
          character.scale.x *= -1;
          character.position.x += character.width;
        }

        this.slideshowViewContainer.addChild(character);

        /**
         * Keep the nameplate object on top of the character.
         */
        if (characterNameplate) {
          this.slideshowViewContainer.addChild(characterNameplate);
        }

        if (characterAlreadyExistedInSomeOtherPose) {
          await this.tweeener.from(character, { alpha: 0, duration: 0.23 });
        } else {
          await this.tweeener.from(character, {
            pixi: { x: character.x - 50, alpha: 0 },
            duration: 0.88,
          });
        }
      }
    };

    const clearCharacterSpeechBubbles = async (animationDuration: number = 0.55) => {
      const oldBubbles = [...bubbles];
      bubbles.length = 0;

      await this.tweeener.to(oldBubbles, {
        alpha: 0,
        duration: animationDuration,
        onComplete: () => oldBubbles.forEach(b => b.destroy()),
        stagger: 0.1,
      });
    };

    const dynamicStoryTextService = this.dynamicStoryTextService;
    const processSpeechBubbleText = dynamicStoryTextService
      ? (text: string) => dynamicStoryTextService.replacePlaceholders(text)
      : (text: string) => text;
    const fallbackSpeechBubbleData: NPCEncounterCinematicSlideSpeechBubbleData = {
      bubbleTextureSuffix: "",
      text: "",
      delay: 0.0,
      x: 0,
      y: 0,
      width: 500,
      height: 150,
      textAnchorX: 0.5,
      textAnchorY: 0.5,
      textScale: 1,
      nameplate: null,
    };
    const updateCharacterSpeechBubbles = async (
      characterSpeechBubblesData: Iterable<Partial<NPCEncounterCinematicSlideSpeechBubbleData>> | null
    ) => {
      clearCharacterSpeechBubbles(); // Just in case

      if (characterSpeechBubblesData == null) {
        return;
      }

      for (const newSpeechBubbleData of characterSpeechBubblesData) {
        const defaultCharacterPoseData = data.speechBubblePresets?.default;
        const presetCharacterPoseData =
          newSpeechBubbleData && getThingPresetData(newSpeechBubbleData, data.speechBubblePresets);
        const speechBubbleData = {
          ...fallbackSpeechBubbleData,
          ...defaultCharacterPoseData,
          ...presetCharacterPoseData,
          ...newSpeechBubbleData,
        };

        /**
         * Wait a pre-configured amount of delay in seconds, before showing the next speech bubble.
         */
        await ticker.delayInterruptableByClick(speechBubbleData.delay);

        // ... then create the speech bubble and add it to the scene and bubbles array
        const bubbleSprite = new Sprite(textures[speechBubbleTexturePrefix + speechBubbleData.bubbleTextureSuffix]);
        bubbleSprite.width = speechBubbleData.width;
        bubbleSprite.height = speechBubbleData.height;

        const bubbleTextString = processSpeechBubbleText(speechBubbleData.text);
        const bubbleTextObject = new Text(bubbleTextString, {
          ...DefaultTextStyle,
          align: "center",
        });
        bubbleTextObject.scale.set(speechBubbleData.textScale);
        bubbleTextObject.anchor.set(0.5, 0.5);

        bubbleTextObject.position.set(
          speechBubbleData.textAnchorX * speechBubbleData.width,
          speechBubbleData.textAnchorY * speechBubbleData.height
        );

        const bubble = new NPCEncounterCinematicSpeechBubble(bubbleSprite, bubbleTextObject);
        bubble.position.copyFrom(speechBubbleData);

        if (speechBubbleData.nameplate) {
          const nameplate = simpleFactory.createSprite(speechBubbleData.nameplate.texture);
          nameplate.position.set(
            speechBubbleData.nameplate.anchorX * speechBubbleData.width,
            speechBubbleData.nameplate.anchorY * speechBubbleData.height
          );
          nameplate.scale.set(speechBubbleData.nameplate.scale);
          nameplate.anchor.set(0.5);
          bubble.addChild(nameplate);
        }

        this.slideshowViewContainer.addChild(bubble);
        bubbles.push(bubble);

        await this.tweeener.from(bubble, { alpha: 0, duration: 0.33 });
      }
    };

    let i = 0;
    const updatedUserChoices = { ...existingChoices } as NPCEncounterCinematicUserChoicesDictionary;
    slidesLoop: while (i < slidesData.length) {
      const slide = slidesData[i] as NPCEncounterCinematicSlideData | undefined;

      if (!slide) {
        break;
      }

      if (slide.conditions) {
        for (const key in slide.conditions) {
          const requiredValue = slide.conditions[key] ?? null;
          const userValue = updatedUserChoices[key] ?? null;
          if (userValue != requiredValue) {
            console.log(
              `Skipping slide ${i} because it's condition ${key} is not met.`,
              `Expected ${slide.conditions[key]}, got ${updatedUserChoices[key]}`
            );
            i++;
            continue slidesLoop;
          }
        }
      }

      if (slide.onExhaustedSlideId) {
        //// Checks the list of choices for any who's property isn't falsy.
        const hasUnseenChoices = slide.userChoices?.some(c => !c.seen);
        if (!hasUnseenChoices) {
          i = slidesData.findIndex(o => o.id === slide.onExhaustedSlideId);
          // console.log(`Skipping slide ${i} because it's onExhaustedSlideId is set.`);
          continue slidesLoop;
        }
      }

      await clearCharacterSpeechBubbles();

      await updateCharacterPose(slide.characterPose);

      if (characterNameplateData) {
        await updateCharacterNameplate(characterNameplateData);
      }

      if (slide.speechBubbles) {
        await updateCharacterSpeechBubbles(slide.speechBubbles);
      }

      const removeSpecialEffect =
        (slide.specialEffect != undefined &&
          this.dynamicSpecialEffectsService?.addSpecialEffect(this, slide.specialEffect)) ||
        null;

      if (advanceOnlyAfterClick && !slide.userChoices) {
        if (!slide.userChoices) await this.waitForClick();
      } else {
        await ticker.delayInterruptableByClick(slide.duration);
      }

      let nextSlideId = slide.nextSlideId;
      if (slide.userChoices) {
        const container = new Container();
        container.position.set(this.slideshowViewBounds.width / 2, this.slideshowViewBounds.height / 2);
        this.slideshowViewContainer.addChild(container);

        if (!this.doTheUserChoiceThing) {
          throw new Error("NPCEncounterCinematic.doTheUserChoiceThing is not defined");
        }

        const chosenChoice = await this.doTheUserChoiceThing(slide.userChoices, container);

        chosenChoice.seen = true;

        console.log(`👉`, { chosenChoice });

        if (!!chosenChoice) {
          if (chosenChoice.action) {
            await Promise.resolve(this.dynamicChoiceActionsService?.performAction(chosenChoice.action));
            await ticker.delay(0.5);
          }

          nextSlideId = chosenChoice.nextSlideId;

          if (chosenChoice.data != undefined) {
            for (const key in chosenChoice.data) {
              updatedUserChoices[key] = chosenChoice.data[key];
            }
          }
        }

        container.destroy({ children: true });
      }

      await removeSpecialEffect?.();

      if (slide.showModal === true) {
        await onLastSlide?.(updatedUserChoices);
      }

      if (nextSlideId != undefined) {
        i = slidesData.findIndex(slide => slide.id === nextSlideId);
      } else {
        i++;
      }

      if (slide.isFinal) {
        break;
      }
    }
    await clearCharacterSpeechBubbles();

    /**
     * Usually, outside logic adds the REWARDS modal here...
     */
    if (this.data.characterTexturePrefix != "assets/images/cinematics/characters/otto/") {
      await onLastSlide?.(updatedUserChoices);
    }
    await updateCharacterNameplate(null);
    await updateCharacterPose(null);

    this.userChoicesDictionary = updatedUserChoices;

    return updatedUserChoices;
  }

  protected abstract play(rewardData: unknown): Promise<unknown>;

  protected async claimRewards() {
    const { ticker } = this.context;
    return await this.claimSpecialRewards().catch(() => ticker.delay(1.5));
  }

  protected updatePositioning() {
    const {
      viewSize: { width: screenViewWidth, height: screenViewHeight },
    } = this.context;
    const { width: slideshowViewWidth, height: slideshowViewHeight } = this.slideshowViewBounds;

    const screenViewRatio = screenViewWidth / screenViewHeight;
    const slideshowViewRatio = slideshowViewWidth / slideshowViewHeight;

    if (screenViewRatio >= slideshowViewRatio) {
      /**
       * If the screen ratio is wider than the slideshow design's view size ratio,
       * Then just scale the slideshow to fit by height,
       * center it on the screen
       * and don't show any black bars,
       */

      /**
       * Make the slideshow smaller when the page is shorter and the reverse if it's taller.
       */
      const scale = screenViewHeight / slideshowViewHeight;
      this.slideshowViewContainer.scale.set(scale);

      /**
       * Center the slideshow on the screen.
       */
      this.slideshowViewContainer.position.set(0.5 * (screenViewWidth - slideshowViewWidth * scale), 0);
    } else {
      /**
       * If the screen ratio is taller than the slideshow design's view size ratio,
       * Then scale the slideshow to fit by width,
       * center it on the screen
       * and cover the height difference with the top and bottom black bar.
       */

      /**
       * Make the slideshow smaller when the page is shorter and the reverse if it's taller.
       */
      const scale = screenViewWidth / slideshowViewWidth;
      this.slideshowViewContainer.scale.set(scale);

      /**
       * Center the slideshow on the screen.
       */
      const heightDifference = 0.5 * (screenViewHeight - slideshowViewHeight * scale);
      this.slideshowViewContainer.position.set(0, heightDifference);
    }
  }

  protected async waitForClick() {
    return new Promise<void>(resolve => {
      let interrupted = false;
      function interrupt() {
        console.log(`🐭 Click!`);
        interrupted = true;
      }
      document.addEventListener("click", interrupt);
      const onEnterFrame = () => {
        if (interrupted) {
          this.context.ticker.remove(onEnterFrame);
          document.removeEventListener("click", interrupt);
          resolve();
        }
      };
      this.context.ticker.add(onEnterFrame);
    });
  }

  protected addStaticCinematicBackdrop(bgTexture: Texture): Sprite {
    const backdrop = new Sprite(bgTexture);
    backdrop.anchor.set(0.5, 0.5);
    this.slideshowViewContainer.addChild(backdrop);
    return backdrop;
  }
}
