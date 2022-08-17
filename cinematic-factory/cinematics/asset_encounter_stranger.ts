import { NPCEncounterCinematicData } from "./types/NPCEncounterCinematicData";

export const asset_encounter_stranger: NPCEncounterCinematicData = {
  advanceOnlyAfterClick: false,

  characterTexturePrefix: "npc-encounters-mysterious-stranger/ms",
  speechBubbleTexturePrefix: "npc-encounters-mysterious-stranger/ms-bubble-",

  characterNameplate: {
    textureId: "cinematics/story/name-badge.png",
    text: "Mysterious Stranger",
    x: 130,
    y: 70,
    scale: 0.6,
    angle: -12,
  },
  background: {
    texture: "../../assets/images-webp/cinematics/timeline-vortex.webp",
    x: 960,
    y: 540,
    scale: 1.5,
  },
  slides: [
    {
      duration: 2,
      characterPose: {
        textureSuffix: "1.png",
        x: 0,
        y: 0,
        scale: 0.25,
      },
      speechBubbles: [
        {
          bubbleTextureSuffix: "1.png",
          text: "Hey Railroader.",
          delay: 0.2,
          x: 475,
          y: 350,
          width: 500,
          height: 150,
          textAnchorX: 0.52,
          textAnchorY: 0.45,
          textScale: 1.25,
        },
      ],
    },
    {
      duration: 2,
      characterPose: {
        textureSuffix: "2.png",
        x: 0,
        y: 0,
        scale: 0.25,
      },
      speechBubbles: [
        {
          bubbleTextureSuffix: "2.png",
          text: "I'm glad I ran into you.",
          delay: 0.6,
          x: 475,
          y: 250,
          width: 580,
          height: 150,
          textAnchorX: 0.58,
          textAnchorY: 0.53,
          textScale: 1.25,
        },
      ],
    },
    {
      duration: 2,
      characterPose: {
        textureSuffix: "2.png",
        x: 0,
        y: 0,
        scale: 0.25,
      },
      speechBubbles: [
        {
          bubbleTextureSuffix: "4.png",
          text: "I normally don't handle\nthese without proper equipment,\nbut these are desperate times.",
          delay: 0.0,
          x: 485,
          y: 400,
          width: 900,
          height: 180,
          textAnchorX: 0.55,
          textAnchorY: 0.45,
          textScale: 1.25,
        },
      ],
    },
    {
      duration: 2,
      characterPose: {
        textureSuffix: "3.png",
        x: 0,
        y: 0,
        scale: 0.25,
      },
      speechBubbles: [
        {
          bubbleTextureSuffix: "4.png",
          text: "Be careful with this stuff.",
          delay: 0.0,
          x: 575,
          y: 250,
          width: 700,
          height: 150,
          textAnchorX: 0.55,
          textAnchorY: 0.45,
          textScale: 1.25,
        },
      ],
    },
    {
      duration: 0,
      characterPose: {
        textureSuffix: "4.png",
        x: -200,
        y: 0,
        scale: 0.25,
      },
      speechBubbles: [],
    },
  ],
  assets: {
    __atlas_common: "../../assets/atlases-webp/atlas-npc-encounters-mysterious-stranger.json",
    npcEncounterBackdrop_MysteriousStranger: "../../assets/images-webp/cinematics/timeline-vortex.webp",
    music: "assets/audio/music/npc-stranger.mp3",
  },
};