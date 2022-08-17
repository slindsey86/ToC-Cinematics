
const PREFIX_ATLAS = "./assets/atlases-webp/";
const PREFIX_IMG = "./assets/images-webp/";

export const assetsNamed = {
  Font_ToC_Icons: "assets/fonts/ToC_Icons.ttf",
  Font_CaviarDreams: "assets/fonts/CaviarDreams.ttf",
  Font_CaviarDreams_Bold: "assets/fonts/CaviarDreams_Bold.ttf",
  Font_Croogla: "assets/fonts/croogla.otf",
  Font_DanielBlack: "assets/fonts/DanielBlack_Fixed.ttf",
  Font_Story: "assets/fonts/Story.ttf",

  BitmapFont_Celestial: "assets/fonts-bitmap/Celestial Bitmap.fnt",

  vortexBackground: PREFIX_IMG + "/cinematics/timeline-vortex.webp",
 
  windowGrunge: PREFIX_IMG + "/ui-windows/grunge.webp",
  windowFrame: PREFIX_IMG + "/ui-windows/frame.webp",
  thomasIntro: PREFIX_IMG + "/cinematics/thomas-intro.webp",

  // __pikachu: "https://upload.wikimedia.org/wikipedia/en/a/a6/Pok%C3%A9mon_Pikachu_art.png",
};

export const assetsUnnamed = [
  PREFIX_ATLAS + "atlas-npc-encounters-mysterious-stranger.json",
  PREFIX_ATLAS + "atlas-npc-encounters-otto.json",
  PREFIX_ATLAS + "atlas-npc-encounters-otto-intro.json",
  PREFIX_ATLAS + "atlas-npc-encounters-thomas.json",
  PREFIX_ATLAS + "atlas-npc-encounters-the-culprit.json",
  PREFIX_ATLAS + "atlas-npc-encounters-story-chapter-01.json",
];

export const assetsAudio = {
  ottoCinematicRiser: "assets/audio/sfx/npc-cinematic-otto/transition-riser.wav",
  ottoCinematicWarp: "assets/audio/sfx/npc-cinematic-otto/transition-warp.wav",
  thomasCinematicRunning: "assets/audio/sfx/npc-cinematic-thomas/running.wav",
  culpritCinematicMmm: "assets/audio/sfx/npc-cinematic-culprit/culprit-mmm.wav",
  mechanicCinematicSigh: "assets/audio/sfx/npc-cinematic-mechanic/sigh.wav",
  mechanicCinematicSteps: "assets/audio/sfx/npc-cinematic-mechanic/footsteps.wav",
  mechanicCinematicRepair: "assets/audio/sfx/npc-cinematic-mechanic/repair_fx.wav",

  newStory: "assets/audio/sfx/npc-cinematic-stories/new-story.wav",
  ticking: "assets/audio/sfx/npc-cinematic-stories/ticking.wav",
};
