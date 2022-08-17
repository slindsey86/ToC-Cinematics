import { boot } from './boot';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Container, DisplayObject } from '@pixi/display';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import type { GameContext } from "./boot";
import { NPCEncounterCinematic } from "./cinematic-factory/cinematics/NPCEncounterCinematic";
import { NPCEncounterCinematic_Culprit } from "./cinematic-factory/cinematics/NPCEncounterCinematic_Culprit";
import { NPCEncounterCinematic_MysteriousStranger } from "./cinematic-factory/cinematics/NPCEncounterCinematic_MysteriousStranger";
import { NPCEncounterCinematic_Otto } from "./cinematic-factory/cinematics/NPCEncounterCinematic_Otto";
import { NPCEncounterCinematic_Thomas } from "./cinematic-factory/cinematics/NPCEncounterCinematic_Thomas";
import { presentUserDialogueChoiceOptions } from "./cinematic-factory/cinematics/story/presentUserDialogueChoiceOptions";
import { NPCEncounterCinematicData } from "./cinematic-factory/cinematics/types/NPCEncounterCinematicData";
import { dynamicChoiceActionFunctions } from "./cinematic-factory/cinematics/utils/dynamicChoiceActionFunctions";
import { dynamicSpecialEffectFunctions } from "./cinematic-factory/cinematics/utils/dynamicSpecialEffectFunctions";
import { asset_encounter_stranger } from './cinematic-factory/cinematics/asset_encounter_stranger';

export const context = boot();
PixiPlugin.registerPIXI({ DisplayObject });
gsap.registerPlugin(PixiPlugin);

export async function playCinematic(
  cinematicData: NPCEncounterCinematicData,
  CinematicClass: new (data: any, fn: any) => NPCEncounterCinematic & {
    play: (...args: any[]) => Promise<void>;
  }
) {
  
  const cinematic = new CinematicClass(cinematicData, () => context.ticker.delay(0.5));

  cinematic.dynamicSpecialEffectsService = dynamicSpecialEffectFunctions();
  cinematic.dynamicChoiceActionsService = dynamicChoiceActionFunctions();
  cinematic.doTheUserChoiceThing = presentUserDialogueChoiceOptions; 

  context.app.stage.addChild(cinematic);

  await cinematic.play();
}

export async function testNPCEncounterCinematic_MysteriousStranger() {
  return await playCinematic(asset_encounter_stranger, NPCEncounterCinematic_MysteriousStranger);
}

async function main() {
  boot();
  console.log("booted")
  console.log("trying")
  await playCinematic(asset_encounter_stranger, NPCEncounterCinematic_MysteriousStranger);
}

main().catch(console.error);
