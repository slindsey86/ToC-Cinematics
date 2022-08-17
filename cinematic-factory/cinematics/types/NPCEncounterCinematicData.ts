import { LiteralUnion } from "type-fest";

type PresetKey = LiteralUnion<"default", string>;

export type WithPossiblePreset<T, TRequiredProperties extends keyof T, TPresetKey> =
  | (Partial<T> & { preset: TPresetKey })
  | (Partial<T> & Pick<T, TRequiredProperties>);

export type NPCEncounterCinematicData<
  TCharacterPosePreset extends PresetKey = PresetKey,
  TSpeechBubbleDataPreset extends PresetKey = PresetKey
> = {
  speechBubbleTexturePrefix?: string;
  characterTexturePrefix?: string;

  characterNameplate?: NPCEncounterCinematicCharacterNameplateData;
  characterStoryBackdropTextureId?: string;

  background: NPCEncounterCinematicBackdropData;

  music?: string;

  slides: NPCEncounterCinematicSlideData[];

  /**
   * A list of predefined character pose properties.
   *
   * Use to shorten the data that needs to be manually enterred for slides in a story.
   *
   * @example
   *
   * If you have this
   *
   * ```ts
   * characterPosePresets: {
   *    "pocket": {
   *       textureSuffix: "1.png",
   *       x: 50,
   *       y: 50,
   *    }
   * }
   * ```
   *
   * and then, inside the slides array you have this
   *
   * ```ts
   * {
   *  characterPose: {
   *   preset: "pocket",
   *   scale: 0.75,
   * },
   * ```
   *
   * that would be the same as if writing
   *
   * ```ts
   * {
   *   characterPose: {
   *     textureSuffix: "1.png",
   *     x: 50,
   *     y: 50,
   *     scale: 0.75,
   *   },
   * }
   * ````
   */
  characterPosePresets?: Partial<Record<TCharacterPosePreset, Partial<NPCEncounterCinematicSlideCharacterPoseData>>>;

  /**
   * A list of predefined speech bubble properties.
   *
   * Use to shorten the data that needs to be manually enterred for slides in a story.
   *
   * @example
   *
   * See the docs for `characterPosePresets` for an example.
   *
   */
  speechBubblePresets?: Partial<Record<TSpeechBubbleDataPreset, Partial<NPCEncounterCinematicSlideSpeechBubbleData>>>;

  /**
   * A list of assets that need to be loaded for sure, before the cinematic can be played.
   */
  assets: { [key: string]: string };

  advanceOnlyAfterClick?: boolean;
};

export type NPCEncounterCinematicCharacterNameplateData = {
  textureId: string;
  text: string;
  x: number;
  y: number;
  scale: number;
  angle?: number;
};

export type NPCEncounterCinematicBackdropData = {
  texture: string;
  x: number;
  y: number;
  scale: number;
};

export type NPCEncounterCinematicSlideData<
  TCharacterPosePreset extends string = string,
  TSpeechBubbleDataPreset extends string = string
> = {
  conditions?: NPCEncounterCinematicUserChoicesDictionary;

  /**
   * A unique identifier for this slide.
   *
   * This is optional in general, but necessary if you need a different slide or slide choice to
   * point to this one.
   *
   * This is the value you should put in `nextSlideId` in those cases.
   */
  id?: string;

  /**
   * The duration of the slide in seconds.
   *
   * It will stay on the screen for this long, before presenting the user with their choices (if any)
   * and continueing onto the next slide, or ending the cinematic if this is a final slide.
   */
  duration: number;

  /**
   * Properties describing the pose of the character in this slide.
   *
   * Set to null to show no character, but still be able to provide the user with choices,
   * or show character bubbles, etc, if you evet need to do so.
   */
  characterPose: WithPossiblePreset<
    NPCEncounterCinematicSlideCharacterPoseData,
    "textureSuffix",
    TCharacterPosePreset
  > | null;

  /**
   * Speech bubbles to show on the slide.
   *
   * Can be empty.
   *
   * Multiple items can be specified, and will result in multiple speech bubbles being shown
   * at the same time (so position them carefully).
   */
  speechBubbles?: Iterable<
    WithPossiblePreset<NPCEncounterCinematicSlideSpeechBubbleData, "text", TSpeechBubbleDataPreset>
  >;

  /**
   * If this array is defined, the user will be presented with this list of choices,
   * and the slide will pause until they select one.
   */
  userChoices?: NPCEncounterCinematicSlideUserChoiceOptionData[];

  /**
   * The slide with this id shoould come ofter this one, unless
   * overriden by a choice's `nextSlideId`.
   *
   * If left undefined, the next slide will just be the next one in the array.
   */
  nextSlideId?: string;

  /**
   * The id of the slide to go to INSTEAD, if no un-"seen" choices are available.
   */
  onExhaustedSlideId?: string;

  /**
   * If `true`, the cinematic will end after this slide.
   */
  isFinal?: true;
  /**
   * If 'true' will pause slides to show a modal before resuming next slide.
   */
  showModal?: boolean;

  specialEffect?: string;
};

export type NPCEncounterCinematicSlideCharacterPoseData = {
  textureSuffix: string;
  x: number;
  y: number;
  scale: number;
  flipped: boolean;
};

export type NPCEncounterCinematicSlideSpeechBubbleData = {
  bubbleTextureSuffix: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textAnchorX: number;
  textAnchorY: number;
  textScale: number;
  delay: number;

  nameplate: null | {
    texture: string;
    scale: number;
    anchorX: number;
    anchorY: number;
  };
};

export type NPCEncounterCinematicSlideUserChoiceOptionData = {
  /**
   * The text to be displayed on the choice button.
   */
  text: string;

  /**
   * The id of the slide to go to if this choice is selected.
   *
   * Will continue with default behaviour if left undefined.
   */
  nextSlideId?: string;

  /**
   * Data that will be stored in the database if this choice is selected.
   *
   * Will eventually be used to keep track of the user's progress in the story, and the choices they made.
   *
   * Optional.
   */
  data?: NPCEncounterCinematicUserChoicesDictionary;

  /**
   * If a function has been predefined with this name, it will be called before continuing to the next slide.
   */
  action?: string;

  /**
   * True if this aption has already been selected before by the user during the current conversation.
   * Used for tinting the choice bubble to indicate viewed content behind it.
   * Primarily useful during looping slides with exhaustive options.
   */
  seen?: boolean;
};

export type NPCEncounterCinematicUserChoicesDictionary = { [key: string]: any };
