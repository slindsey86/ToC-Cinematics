import { MusicSource } from '@game/constants/paths/MusicSource';
import {
  TilingSpriteDimmer,
  TilingSpriteDimmerTemplates,
} from '@game/ui/common/TilingSpriteDimmer';
import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { CallbackList } from '@sdk/utils/callbacks/CallbackList';
import { NPCEncounterCinematic } from './NPCEncounterCinematic';
import { NPCEncounterReward } from './NPCEncounterReward';

export class NPCEncounterCinematic_MysteriousStranger extends NPCEncounterCinematic {
  private vortexTween!: any;

  async playIntroAnimation() {
    const { app, world, ticker } = this.context;
  }

  async play(reward: NPCEncounterReward) {
    const { app, main, ticker, contracts, spinner, music } = this.context;

    const cleanUpCallbacks = new CallbackList();

    /**
     * Even though on construction the dimmer's alpha is zero,
     * we instantiate it all the way back here, to prevent the user
     * from interacting with the world behind the cinematic.
     */
    const dimmer = new TilingSpriteDimmer({
      ...TilingSpriteDimmerTemplates.SCANLINES,
    });
    dimmer.interactive = true;
    this.addChildAt(dimmer, 0);

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

    const stopHidingTheCogWheelMenu = main.hud.reasonsToHideCogWheelMenu.add(
      'OngoingNPCCinematic'
    );
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
        this.enchantments.waitUntil.orThrowError(
          () => this.textures || this.texturesError
        ),
        `Loading textures for NPC encounter cinematic...`
      );

      const characterMusicTrack = music.playTrack(
        MusicSource.NPCEncounterStranger,
        true
      );
      cleanUpCallbacks.push(characterMusicTrack.stop);

      await this.playIntroAnimation();

      await ticker.delay(0.1);

      await ticker.delay(0.9);

      const flashes = this.addFlashQuad();
      flashes.destroy();

      await ticker.delay(0.1);

      // ,,, add the vortex effect
      const vortex = this.addCinematicBackdrop(
        textures[this.data.background.texture]
      );
      vortex.position.copyFrom(this.data.background);
      vortex.scale.set(this.data.background.scale);

      await Promise.all([
        dimmer.show(),
        this.letterBox.playShowAnimation(),
        this.tweeener.from(vortex, {
          pixi: { scale: vortex.scale.x * 1.2, alpha: 0 },
          duration: 0.7,
          overwrite: 'auto',
        }),
      ]);

      await ticker.delay(0.3);

      const showRewardsModal = async () => {
        const { modal, promise } =
          reward.type === 'TOCIUM'
            ? this.context.modals.strangerReward_Tocium(reward)
            : this.context.modals.strangerReward_CenturyVial(reward.amount);

        /**
         * By default the modal will already be a child of context.stageContainers._modals,
         * but we want to slip it in between the character and the backdrop.
         */
        this.slideshowViewContainer.addChildAt(modal, 1);
        modal.scale.set(1.15);
        modal.position.set(
          this.slideshowViewBounds.width / 2,
          this.slideshowViewBounds.height / 2
        );

        await promise;

        await this.claimRewards();
      };
      await this.playStorySlides(this.data, showRewardsModal);

      // ... remove the vortex effect
      await this.tweeener.to(vortex, {
        pixi: { scale: vortex.scale.x * 1.05, alpha: 0 },
        duration: 0.7,
        ease: 'power.in',
        overwrite: 'auto',
        onComplete: () => {
          this.vortexTween.kill();
          vortex.destroy();
        },
      });
    } catch (error) {
      await this.context.modals.warning(
        '' + error,
        'Failed to play NPC Encounter.'
      );
    } finally {
      await dimmer.hide();

      cleanUpCallbacks.reverseCallAllAndClear();

      await this.letterBox.playHideAnimation();

      stopSilence();

      this.destroy();
    }
  }

  addFlashQuad() {
    const MAX_ALPHA = 0.23456789;
    const lightning = this.addChildAt(new Sprite(Texture.WHITE), 0);
    this.context.utils.makeScreenLayer(lightning, null);
    lightning.alpha = 0;

    this.context.utils.overrideRenderMethod(lightning, () => {
      const rand = Math.random();
      lightning.alpha = MAX_ALPHA * rand * rand * rand * rand;
    });

    return lightning;
  }

  addCinematicBackdrop(bgTexture: Texture): Sprite {
    const sprite = new Sprite(bgTexture);
    sprite.anchor.set(0.5, 0.5);
    this.slideshowViewContainer.addChild(sprite);
    this.vortexTween = this.tweeener.to(sprite, {
      rotation: -6.28319,
      repeat: -1,
      duration: 100,
      ease: 'none',
    });
    return sprite;
  }
}
