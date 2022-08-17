import { __window__ } from "@debug/__";
import { __DEBUG__ } from "@debug/__DEBUG__";
import { GameSingletons } from "@game/app/GameSingletons";
import { GenericModalBackgroundOptions } from "@game/ui/generic-modals/GenericModalFactory";
import { getTextureFromIPFSHash } from "@game/ui/popups/station-dashboard-components/billboard/utils/getTextureFromIPFSHash";
import { Texture } from "@pixi/core";
import { Sprite } from "@pixi/sprite";
import { AssetTemplateId, ContractName } from "@sdk-integration/contracts";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { NPCEncounterReward } from "@game/cinematics/NPCEncounterReward";

export type CulpritEncounterRewardRowData = { reward_id: number; reward: string };

export function createCulpritEncounterRewardModal(rewardData?: CulpritEncounterRewardRowData) {
  const { contracts, modals, spinner } = GameSingletons.getGameContext();

  let rewardId = -1;
  const REWARD_TYPE = "TEMP";

  if (__DEBUG__ && __window__.__CulpritReward__) rewardData = __window__.__CulpritReward__;

  async function getRewardRowData() {
    if (rewardData) {
      return rewardData;
    }

    const rewardRows = await spinner.showDuring(
      contracts.tables.loadRows<CulpritEncounterRewardRowData>(
        "rewards",
        {
          scope: contracts.currentUserName,
          limit: 100,
          reverse: true,
        },
        ContractName.RR
      )
    );
    // const rewardRows = [{ reward_id: 1, reward: "389548 TEMP" }];

    const rewardRowData = rewardRows.find(predicate => predicate.reward.includes(REWARD_TYPE));
    if (!rewardRowData) {
      throw new Error(`Could not find row with reward type ${REWARD_TYPE}`);
    }

    return rewardRowData;
  }

  async function loadNFTTemplateIdFromReward(): Promise<AssetTemplateId> {
    const rewardRowData = await getRewardRowData();

    rewardId = rewardRowData.reward_id;

    const rewardString = rewardRowData.reward;
    if (!rewardString) {
      throw new Error(`Could not find reward string for reward type ${REWARD_TYPE}`);
    }

    const [reward] = rewardString.split(" ");
    const rewardTemplateId = reward;
    if (!rewardTemplateId) {
      throw new Error(`Could not find reward template id for ${rewardTemplateId} (${rewardString})`);
    }

    return rewardTemplateId as AssetTemplateId;
  }

  const promiseAndModal = modals.__createModalAndPromise<number>(
    {
      cornerDetailType: null,
      background: GenericModalBackgroundOptions.GREEN,
      title: `A gift from the Culprit`,
      content: "The culprit took pity on your puny\ntrain, and gave you a commodity.",
      buttons: [
        {
          labelText: "CLAIM",
          onClick: async function (this) {
            await this.hideAndDestroy();
            return this.emitResult?.(rewardId);
          },
        },
      ],
    },
    {
      load: async () => {
        const nftTemplateId = await loadNFTTemplateIdFromReward();
        const nftTemplateData = await contracts.assets.getAssetTemplateData<{ img: string; name: string }>(
          nftTemplateId
        );
        const nftTexture = await getTextureFromIPFSHash(nftTemplateData.img);
        return nftTexture;
      },
      initialize: (nftTexture: Texture | null) => {
        if (!nftTexture) throw new Error("nftTexture is null");
        const nftSprite = new Sprite(nftTexture);
        nftSprite.name = "nftSprite";
        nftSprite.anchor.set(0.5);
        nftSprite.position.set(1168, 378);
        nftSprite.scale.set(280 / nftTexture.width);
        nftSprite.angle = 20;
        promiseAndModal.modal.addChild(nftSprite);

        const tweeener = new TemporaryTweeener(nftSprite);
        Object.assign(nftSprite, {
          show() {
            return tweeener.from(nftSprite, {
              pixi: { scale: 0 },
              duration: 0.69,
              ease: "elastic.out",
            });
          },
          hide() {
            return tweeener.to(nftSprite, {
              pixi: { scale: 0 },
              duration: 0.19,
              ease: "back.in",
            });
          },
        });
      },
    }
  );

  return promiseAndModal;
}
