import { Container } from "@pixi/display";
import { app } from "..";
import type { GameContext } from "../boot";
import { NPCEncounterCinematic } from "./cinematics/NPCEncounterCinematic";
import { NPCEncounterCinematic_Culprit } from "./cinematics/NPCEncounterCinematic_Culprit";
import { NPCEncounterCinematic_MysteriousStranger } from "./cinematics/NPCEncounterCinematic_MysteriousStranger";
import { NPCEncounterCinematic_Otto } from "./cinematics/NPCEncounterCinematic_Otto";
import { NPCEncounterCinematic_Thomas } from "./cinematics/NPCEncounterCinematic_Thomas";
import { presentUserDialogueChoiceOptions } from "./cinematics/story/presentUserDialogueChoiceOptions";
import { NPCEncounterCinematicData } from "./cinematics/types/NPCEncounterCinematicData";
import { dynamicChoiceActionFunctions } from "./cinematics/utils/dynamicChoiceActionFunctions";
import { dynamicSpecialEffectFunctions } from "./cinematics/utils/dynamicSpecialEffectFunctions";

export async function playCinematic(
  cinematicData: NPCEncounterCinematic,
  CinematicClass: new (data: any, fn: any) => NPCEncounterCinematic & {
    play: (...args: any[]) => Promise<void>;
  }
) {

  const _cinematic = new Container();

  const cinematic = new CinematicClass(cinematicData, () => ticker.delay(0.5));

  cinematic.dynamicChoiceActionsService = dynamicChoiceActionFunctions();
  cinematic.doTheUserChoiceThing = presentUserDialogueChoiceOptions;
 

  return cinematic;
}

export async function playOttoCinematic(friendshipLevel: number, part: string) {

  const friendLvl = friendshipLevel;
  const fulldata: NPCEncounterCinematicData = await combineOttoSlidesBasedOnFriendLevel(friendLvl, part);

  const cinematic = new NPCEncounterCinematic_Otto(fulldata, () => context.ticker.delay(0.5));

  cinematic.dynamicChoiceActionsService = dynamicChoiceActionFunctions();
  cinematic.doTheUserChoiceThing = presentUserDialogueChoiceOptions;

  cinematic.dynamicSpecialEffectsService = dynamicSpecialEffectFunctions();

  return cinematic
}

export async function combineOttoSlidesBasedOnFriendLevel(friendshipLevel: number, partBlockString: string) {
  let ctPartSuffix = partBlockString;
  if (friendshipLevel > 19) friendshipLevel = 20;

  if (!friendshipLevel) throw new Error("Otto encounter level not found");
  const friendLvl = friendshipLevel;
  const encounterPrefix = "asset_encounter_otto_";
  const typeIntro = "greeting_";
  const typeCTPart = "CTPart_block_";
  const typeStory = "Story_block_";
  const typeFriendship = "friendship_";
  const typeOutro = "outro_";
  

  let friendLvlStats = await getFriendLvlStats(friendLvl);

  const introString = encounterPrefix + typeIntro + friendLvlStats.friendLevelSuffix;
  const partString = encounterPrefix + typeCTPart + ctPartSuffix;
  const storyString = encounterPrefix + typeStory + friendLvl;
  const friendshipString = encounterPrefix + typeFriendship + friendLvlStats.friendBlockSuffix;
  const outroString = encounterPrefix + typeOutro + friendLvlStats.friendLevelSuffix;
  console.log("PBS: " + partBlockString);
  console.log("IS: " + introString);
  console.log("SS: " + storyString);
  console.log("FS: " + friendshipString);
  console.log("OS: " + outroString);
  const intro = await getCinematicsData(introString);
  const part = await getCinematicsData(partString);
  const story = await getCinematicsData(storyString);
  const friendship = await getCinematicsData(friendshipString);
  const outro = await getCinematicsData(outroString);
  console.log("PART: " + part);
  if (!intro) throw new Error("Slide data not found");
  const fulldata = intro;

  fulldata.slides.push(...part.slides, ...story.slides, ...friendship.slides, ...outro.slides);

  return fulldata;
}

export async function getFriendLvlStats(friendLvl: number) {
  let friendBlockSuffix;
  let friendLevelSuffix;

  if (friendLvl == 1) {
    friendLevelSuffix = "1";
    friendBlockSuffix = "1";
  } else if (friendLvl < 5 && friendLvl > 1) {
    friendLevelSuffix = "1";
    friendBlockSuffix = "6";
  } else if (friendLvl == 5) {
    friendLevelSuffix = "2";
    friendBlockSuffix = "2";
  } else if (friendLvl > 5 && friendLvl < 10) {
    friendLevelSuffix = "2";
    friendBlockSuffix = "6";
  } else if (friendLvl == 10) {
    friendLevelSuffix = "3";
    friendBlockSuffix = "3";
  } else if (friendLvl > 10 && friendLvl < 18) {
    friendLevelSuffix = "3";
    friendBlockSuffix = "6";
  } else if (friendLvl == 18) {
    friendLevelSuffix = "4";
    friendBlockSuffix = "4";
  } else if (friendLvl == 19) {
    friendLevelSuffix = "5";
    friendBlockSuffix = "5";
  } else if (friendLvl > 19) {
    friendLevelSuffix = "5";
    friendBlockSuffix = "6";
  }

  return { friendBlockSuffix, friendLevelSuffix };
}

export async function testNPCEncounterCinematic_MysteriousStranger() {
  return await playCinematic("asset_encounter_stranger", NPCEncounterCinematic_MysteriousStranger);
}

export async function testNPCEncounterCinematic_Thomas() {
  return await playCinematic("asset_encounter_thomas", NPCEncounterCinematic_Thomas);
}

export async function testNPCEncounterCinematic_Otto() {
  return await playOttoCinematic(10, "WHEELS");
}

export async function testNPCEncounterCinematic_Culprit() {
  return await playCinematic("asset_encounter_culprit", NPCEncounterCinematic_Culprit);
}
