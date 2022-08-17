import { MusicSource } from "@game/constants/paths/MusicSource";
import { SolidDimmer } from "@game/ui/common/SolidDimmer";
import { CenturyTrainPartsDataService } from "@game/ui/windows/market/pages/ct-parts/CTPartsDataService";
import { AnimatedSprite } from "@pixi/sprite-animated";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";
import { NPCEncounterCinematic } from "./NPCEncounterCinematic";
import { NPCEncounterReward } from "./NPCEncounterReward";

export class NPCEncounterCinematic_Otto extends NPCEncounterCinematic {
  async playIntroAnimation() {
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

    const introAnimationResourceName = "assets/atlases-webp/atlas-npc-encounters-otto-intro.json";
    const introAnimationTextures = this.context.assets.getTextures(introAnimationResourceName);
    const introAnimation = new AnimatedSprite(introAnimationTextures, true);
    this.slideshowViewContainer.addChild(introAnimation);

    this.context.sfx.play("ottoCinematicRiser");
    this.context.sfx.play("ottoCinematicWarp");

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

  async play(reward?: NPCEncounterReward) {
    console.log({ reward });

    const { main, ticker, spinner, music } = this.context;

    const cleanUpCallbacks = new CallbackList();

    /**
     * Even though on construction the dimmer's alpha is zero,
     * we instantiate it all the way back here, to prevent the user
     * from interacting with the world behind the cinematic.
     */
    const dimmer = new SolidDimmer();
    dimmer.interactive = true;
    this.addChildAt(dimmer, 0);
    cleanUpCallbacks.push(() => dimmer.hide().then(() => dimmer.destroy()));

    /**
     * If nobody has started loading the required assets yet by calling NPCEncounterCinematic.loadAssets(),
     * then now is the time to do that...
     **/
    if (!this.texturesStartedLoading) {
      /**
       * We're not awaiting this, because we want to play the part of the cinematic that doesn't require
       * any assets to be loaded in the meantime to better optimize how we use the user's time.
       */
      this.loadAssets();
    }

    const stopSilence = music.playSilence();

    /**
     * A bit of suspense
     */
    await ticker.delay(0.3);

    const stopHidingTheCogWheelMenu = main.hud.reasonsToHideCogWheelMenu.add("OngoingNPCCinamatic");
    cleanUpCallbacks.push(stopHidingTheCogWheelMenu);

    try {
      /**
       * Now is the time to make sure we've loaded all assets
       * necessary for the rest of the cinematic.
       *
       * ticker.waitUntil() is a promise that resolves when the given function returns a non-falsey value.
       * In our case, that is when the textures have been loaded and assigned to our local array ref.
       *
       * spinner.showDuring() shows the loading spinner while the given async function is running.
       */
      const textures = await spinner.showDuring(
        this.enchantments.waitUntil.orThrowError(() => this.textures || this.texturesError),
        `Loading textures for NPC encounter cinematic...`
      );

      await this.playIntroAnimation();

      dimmer.show();

      const characterMusicTrack = music.playTrack(MusicSource.NPCEncounterOtto, true);
      cleanUpCallbacks.push(characterMusicTrack.stop);

      // ,,, add the vortex effect
      const backdropTexture = textures[this.data.background.texture];
      const backdrop = this.addStaticCinematicBackdrop(backdropTexture);
      backdrop.position.copyFrom(this.data.background);
      backdrop.scale.set(this.data.background.scale);

      await Promise.all([
        this.letterBox.playShowAnimation(),
        this.tweeener.from(backdrop, {
          pixi: { scale: backdrop.scale.x * 1.2, alpha: 0 },
          duration: 0.7,
          overwrite: "auto",
        }),
      ]);

      await ticker.delay(0.3);

      const showRewardsModal = async () => {
        if (reward != undefined) {
          const { modal, promise } = this.context.modals.ottoReward(reward);

          /**
           * By default the modal will already be a child of context.stageContainers._modals,
           * but we want to slip it in between the character and the backdrop.
           */
          this.slideshowViewContainer.addChildAt(modal, 1);
          modal.position.set(this.slideshowViewBounds.width / 1.6, this.slideshowViewBounds.height / 2);
          modal.scale.set(0.85);

          const choice = await promise;

          if (choice === "buy") {
            await spinner.showDuring(this.performPurchase(reward));
          }
        }
      };
      await this.playStorySlides(this.data, showRewardsModal);

      // ... remove the backdrop
      await this.tweeener.to(backdrop, {
        pixi: { scale: backdrop.scale.x * 1.05, alpha: 0 },
        duration: 0.7,
        ease: "power.in",
        overwrite: "auto",
        onComplete: () => {
          backdrop.destroy();
        },
      });
    } catch (error) {
      await this.context.modals.warning("" + error, "Failed to play NPC Encounter.");
    } finally {
      cleanUpCallbacks.reverseCallAllAndClear();

      await this.letterBox.playHideAnimation();

      stopSilence();

      this.destroy();
    }
  }

  async performPurchase(reward: NPCEncounterReward) {
    const dataService = new CenturyTrainPartsDataService();
    const data = await dataService.getMyDiscoveredPartsList();

    const partData = data.find(part => part.tokenSymbol === reward.type);

    if (!partData) {
      throw new Error(`Could not find part data for ${reward.type}`);
    }

    await dataService.performPurchase(partData);
    await this.context.ticker.delay(0.25);
    await this.context.userDataCtrl.updateAll();
  }
}
