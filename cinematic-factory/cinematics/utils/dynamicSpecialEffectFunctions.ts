import { __createPikachu } from "@debug/special/pikachu";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { NPCEncounterCinematic } from "@game/cinematics/NPCEncounterCinematic";

export const SUPER_QUICK_AND_DIRTY_GLOBAL_PARAMS_STORE = {
  ottoEncountersCount: 0,
};

export function dynamicSpecialEffectFunctions() {
  const dictionary: Record<string, (cinematic: NPCEncounterCinematic) => () => void | Promise<void>> = {
    pikachu: cinematic => {
      const pikachu = __createPikachu();
      cinematic.slideshowViewContainer.addChild(pikachu);

      const viewCenter = {
        x: cinematic.slideshowViewBounds.width * 0.5,
        y: cinematic.slideshowViewBounds.height * 0.5,
      };
      pikachu.position.set(viewCenter.x, viewCenter.y);

      const tweeener = new TemporaryTweeener(pikachu);
      tweeener.fromTo(pikachu, { pixi: { scale: 0 } }, { pixi: { scale: 2 }, duration: 0.95, ease: "elastic.out" });

      const clear = async () => {
        await tweeener.to(pikachu, { pixi: { scale: 0 }, duration: 0.3, ease: "bakc.in" });
        pikachu.destroy({ children: true });
      };

      return clear;
    },
    ampVial: cinematic => {
      const ampVial = Sprite.from("century-vials/1.png");
      cinematic.slideshowViewContainer.addChild(ampVial);
      ampVial.anchor.set(0.5);

      const viewCenter = {
        x: cinematic.slideshowViewBounds.width * 0.5,
        y: cinematic.slideshowViewBounds.height * 0.5,
      };
      ampVial.position.set(viewCenter.x, viewCenter.y);

      const tweeener = new TemporaryTweeener(ampVial);
      tweeener.fromTo(ampVial, { pixi: { scale: 0 } }, { pixi: { scale: 1.25 }, duration: 0.95, ease: "elastic.out" });

      const clear = async () => {
        await tweeener.to(ampVial, { pixi: { scale: 0 }, duration: 0.3, ease: "bakc.in" });
        ampVial.destroy({ children: true });
      };

      return clear;
    },

    ottoFriendshipBadge: cinematic => {
      function getOttoBadgeTextureSuffix(friendLvl: number) {
        switch (friendLvl) {
          case 1:
            return "lvl1-fellow.png";
          case 5:
            return "lvl2-colleague.png";
          case 10:
            return "lvl3-friend.png";
          case 18:
            return "lvl4-enemy.png";
          case 19:
            return "lvl5-bro.png";
        }
      }

      const encountersCount = SUPER_QUICK_AND_DIRTY_GLOBAL_PARAMS_STORE.ottoEncountersCount;
      const ottoBadgeSuffix = getOttoBadgeTextureSuffix(encountersCount);
      const ottoFriendshipBadgeTextureId = "ui-achievements/otto/" + ottoBadgeSuffix;
      const ottoFriendshipBadge = Sprite.from(ottoFriendshipBadgeTextureId);
      cinematic.slideshowViewContainer.addChild(ottoFriendshipBadge);
      ottoFriendshipBadge.anchor.set(0.5);

      const viewCenter = {
        x: cinematic.slideshowViewBounds.width * 0.5,
        y: cinematic.slideshowViewBounds.height * 0.5,
      };
      ottoFriendshipBadge.position.set(viewCenter.x, viewCenter.y);

      const tweeener = new TemporaryTweeener(ottoFriendshipBadge);
      tweeener.fromTo(
        ottoFriendshipBadge,
        { pixi: { scale: 0 } },
        { pixi: { scale: 1.75 }, duration: 0.95, ease: "elastic.out" }
      );

      const clear = async () => {
        await tweeener.to(ottoFriendshipBadge, { pixi: { scale: 0 }, duration: 0.3, ease: "bakc.in" });
        ottoFriendshipBadge.destroy({ children: true });
      };

      return clear;
    },
  };

  return {
    addSpecialEffect(cinematic: NPCEncounterCinematic, key: string) {
      const $function = dictionary[key];

      if (!$function) {
        console.error(`Special Effect not found — "${key}()"`);
        return null;
      }

      const removeSpecialEffect = $function(cinematic);

      return removeSpecialEffect;
    },
  };
}

export type DynamicSpecialEffectsService = ReturnType<typeof dynamicSpecialEffectFunctions>;
