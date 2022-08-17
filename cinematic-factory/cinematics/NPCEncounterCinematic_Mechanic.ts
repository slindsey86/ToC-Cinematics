import { __waitForKeyPress } from "@debug/utils/__waitForKeyPress";
import { MusicSource } from "@game/constants/paths/MusicSource";
import { SolidDimmer } from "@game/ui/common/SolidDimmer";
import { getLocomotiveCircularPreview } from "@game/ui/repair/train-pins/getLocomotiveCircularPreview";
import { TrainStatusPin } from "@game/ui/repair/train-pins/TrainStatusPin";
import { createSimpleTweener } from "@sdk/time/SimpleTweener";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";
import { delay } from "@sdk/utils/promises";
import { NPCEncounterCinematic } from "./NPCEncounterCinematic";
import { createMechanicEncounterRewardModal } from "./utils/createMechanicEncounterRewardModal";

export class NPCEncounterCinematic_Mechanic extends NPCEncounterCinematic {
  async playIntroAnimation() {
    const { simpleFactory } = this.context;
    const character = simpleFactory.createSprite("assets/images/cinematics/characters/the-mechanic/mech-1.png");

    character.anchor.set(0.0, 1.0);
    character.scale.set(0.9);

    this.slideshowViewContainer.addChild(character);

    this.context.sfx.play("mechanicCinematicSteps");

    const runningSoundDuration = 2.3;

    if (isNaN(runningSoundDuration)) {
      throw new Error("runningSoundDuration is NaN");
    }

    const runningTweenDuration = 0.45;
    const runningTweenDelay = runningSoundDuration - runningTweenDuration - 0.5;
    await this.context.ticker.delay(runningTweenDelay);

    const stepsCount = 1.5;
    const simpleTweener = createSimpleTweener();
    await simpleTweener.tween(
      p => {
        const x = p * character.width - character.width;
        const y = this.slideshowViewBounds.height + 50 * Math.abs(Math.sin(p * Math.PI * stepsCount));
        character.position.set(x, y);
      },
      {
        duration: runningTweenDuration,
      }
    );
    await this.context.ticker.delay(0.5);

    this.context.sfx.play("mechanicCinematicSigh");

    await this.context.ticker.delay(1.8);

    character.destroy();
  }

  async createTrainPin(locoName: string, healthPercentage: number) {
    //// Train pin circle
    const trainPin = new TrainStatusPin(locoName, healthPercentage);
    trainPin.position.set(65, 75);
    trainPin.scale.set(0.4);

    return trainPin;
  }

  async createHealthCircleWithImagefromTrainLoco() {
    if (this.train != undefined) {
      const locoImageRound = getLocomotiveCircularPreview(this.train.locomotive!.data.img);
      if (!locoImageRound) {
        throw new Error("Loco not found");
      }
      const trainHealthCirclePin = await this.createTrainPin(locoImageRound, 0);

      return trainHealthCirclePin;
    }
  }

  async play() {
    const { main, ticker, spinner, music } = this.context;
    const trainHealthCircle = await this.createHealthCircleWithImagefromTrainLoco();
    //// Prep the reward modal all the way back here, so that it has time to load its stuff
    if (!this.train) {
      throw new Error("Train is undefined");
    }
    const { modal: rewardModal, showModal: showRewardModal } = createMechanicEncounterRewardModal(this.train);

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

      const characterMusicTrack = music.playTrack(MusicSource.NPCEncounterMechanic, true);
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
        if (!trainHealthCircle) {
          throw new Error("TrainHealthCircle is undefined");
        }
        trainHealthCircle.name = "trainHealthCircle";
        trainHealthCircle.scale.set(1.25);
        trainHealthCircle.pivot.set(0.5);
        trainHealthCircle.position.set(1138, 438);

        rewardModal.addChild(trainHealthCircle);

        delay(1.5).then(() => {
          this.context.sfx.play("mechanicCinematicRepair");
          trainHealthCircle.percentageBar.setTargetFraction(1);
        });

        await showRewardModal();

        await spinner.showDuring(this.performClaim());
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

  async performClaim() {}
}
