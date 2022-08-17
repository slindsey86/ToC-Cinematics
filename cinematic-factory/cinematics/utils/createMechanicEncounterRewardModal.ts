import { __window__ } from "@debug/__";
import { __DEBUG__ } from "@debug/__DEBUG__";
import { GameSingletons } from "@game/app/GameSingletons";
import { GenericModalBackgroundOptions } from "@game/ui/generic-modals/GenericModalFactory";
import { TrainEntity } from "@game/data/entities/TrainEntity";
import { ReadonlyObjectDeep } from "type-fest/source/readonly-deep";

export function createMechanicEncounterRewardModal(train: ReadonlyObjectDeep<TrainEntity>) {
  const { modals } = GameSingletons.getGameContext();

  if (__DEBUG__ && __window__.__MechanicReward__) train = __window__.__MechanicReward__;

  const promiseAndModal = modals.__createModalAndPromise<number>({
    cornerDetailType: null,
    background: GenericModalBackgroundOptions.GREEN,
    title: `Whoo That's Shiny`,
    content: `The Mechanic repaired ${train?.name}\nto 100% Condition.`,
    buttons: [
      {
        labelText: "THANKS!",
        onClick: async function (this) {
          await this.hideAndDestroy();
          return this.emitResult?.(null);
        },
      },
    ],
  });

  return promiseAndModal;
}
