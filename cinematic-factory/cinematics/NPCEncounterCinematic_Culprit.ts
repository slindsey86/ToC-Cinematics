import { __waitForKeyPress } from "@debug/utils/__waitForKeyPress";
import { MusicSource } from "@game/constants/paths/MusicSource";
import { SolidDimmer } from "@game/ui/common/SolidDimmer";
import { Sound } from "@pixi/sound";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";
import { NPCEncounterCinematic } from "./NPCEncounterCinematic";
import { createCulpritEncounterRewardModal } from "./utils/createCulpritEncounterRewardModal";

export class NPCEncounterCinematic_Culprit extends NPCEncounterCinematic {
  async playIntroAnimation() {
    const { simpleFactory } = this.context;
    const character = simpleFactory.createSprite("npc-encounters-the-culprit/culprit-2.png");
    character.position.set(1350, 1100);
    character.angle = -80;
    character.scale.set(2.0);
    this.slideshowViewContainer.addChild(character);

    await this.tweeener.from(character, { x: 1800, duration: 3.5, ease: "power2.in" });

    this.context.sfx.play("culpritCinematicMmm");

    await this.context.ticker.delay(1.7);

    await this.tweeener.to(character, { x: 1920, duration: 0.3, ease: "back.in" });

    character.destroy();
  }

  async play() {
    const { main, ticker, spinner, music } = this.context;

    //// Prep the reward modal all the way back here, so that it has time to load its stuff
    const { modal: rewardModal, showModal: showRewardModal } = createCulpritEncounterRewardModal();

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

      await this.letterBox.playShowAnimation();

      await this.playIntroAnimation();

      dimmer.show();

      const characterMusicTrack = music.playTrack(MusicSource.NPCEncounterCulprit, true);
      cleanUpCallbacks.push(characterMusicTrack.stop);

      const backdrop = this.addStaticCinematicBackdrop(textures[this.data.background.texture]);
      backdrop.position.copyFrom(this.data.background);
      backdrop.scale.set(this.data.background.scale);

      await Promise.all([
        this.tweeener.from(backdrop, {
          pixi: { scale: backdrop.scale.x * 1.2, alpha: 0 },
          duration: 0.7,
          overwrite: "auto",
        }),
      ]);

      await ticker.delay(0.3);

      const displayRewardModal = async () => {
        const { contracts, spinner } = this.context;

        /**
         * By default the modal will already be a child of context.stageContainers._modals,
         * but we want to slip it in between the character and the backdrop.
         */
        this.slideshowViewContainer.addChildAt(rewardModal, 1);
        rewardModal.scale.set(1.15);
        rewardModal.position.set(this.slideshowViewBounds.width / 2, this.slideshowViewBounds.height / 2);

        const rewardId = await showRewardModal();
        await spinner.showDuring(this.performClaim(rewardId));
      };
      await this.playStorySlides(this.data, displayRewardModal);

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
      console.error(error);
      await this.context.modals.warning("" + error, "Failed to play NPC Encounter.");
    } finally {
      cleanUpCallbacks.reverseCallAllAndClear();

      await ticker.delay(0.87);

      await this.letterBox.playHideAnimation();

      stopSilence();

      this.destroy();
    }
  }

  async performClaim(rewardId: number) {
    await this.context.contracts.claimSpecialRewards(rewardId);
  }
}
