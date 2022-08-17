import { __window__ } from "@debug/__";
import { GameSingletons } from "@game/app/GameSingletons";
import { MusicSource } from "@game/constants/paths/MusicSource";
import { TilingSpriteDimmer, TilingSpriteDimmerTemplates } from "@game/ui/common/TilingSpriteDimmer";
import { Texture } from "@pixi/core";
import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { TemporaryTweeener } from "@sdk/pixi/animations/TemporaryTweener";
import { CallbackList } from "@sdk/utils/callbacks/CallbackList";
import { CinematicConversationBackdrop } from "./components/CinematicConversationBackdrop";
import { NPCEncounterCinematic } from "./NPCEncounterCinematic";

export class NPCEncounterCinematic_Story extends NPCEncounterCinematic {
  public shouldShowIntroModal = true;

  async play() {
    const { main, ticker, spinner, music } = this.context;

    const cleanUpCallbacks = new CallbackList();

    try {
      /**
       * Even though on construction the dimmer's alpha is zero,
       * we instantiate it all the way back here, to prevent the user
       * from interacting with the world behind the cinematic.
       */
      const dimmer = new TilingSpriteDimmer({
        ...TilingSpriteDimmerTemplates.SCANLINES,
        maxAlpha: 0.375,
      });
      dimmer.interactive = true;
      cleanUpCallbacks.push(dimmer.hide.bind(dimmer));
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
      cleanUpCallbacks.push(stopSilence);

      const stopHidingTheCogWheelMenu = main.hud.reasonsToHideCogWheelMenu.add("OngoingNPCCinematic");
      cleanUpCallbacks.push(stopHidingTheCogWheelMenu);

      /**
       * Now is the time to make sure we've loaded all assets
       * necessary for the rest of the cinematic.
       *
       * ticker.waitUntil() is a promise that resolves when the given function returns a non-falsey value.
       * In our case, that is when the textures have been loaded and assigned to our local array ref.
       *
       * spinner.showDuring() shows the loading spinner while the given async function is running.
       */
      await spinner.showDuring(
        this.enchantments.waitUntil.orThrowError(() => this.textures || this.texturesError),
        `Loading textures for NPC encounter cinematic...`
      );

      dimmer.show();

      await this.letterBox.playShowAnimation();
      cleanUpCallbacks.push(() => this.letterBox.playHideAnimation());

      await ticker.delay(0.24);

      const flash = this.addFlashQuad();
      await flash.playShowAnimation();
      await flash.playHideAnimation();
      flash.destroy();

      const musicResourcePath = this.data.music ?? this.data?.assets["music"] ?? MusicSource.StoryEncounter_Chapter01;
      const characterMusicTrack = music.playTrack(musicResourcePath, true);
      cleanUpCallbacks.push(characterMusicTrack.stop);

      const backdrops = this.addStoryCinematicBackdrop();
      cleanUpCallbacks.push(() => backdrops.playHideAnimationAndDestroy());
      await backdrops.playShowAnimation();

      const choices = await this.playStorySlides(this.data);

      return choices;
    } catch (error) {
      await this.context.modals.warning("" + error, "Failed to play NPC Encounter.");
    } finally {
      while (cleanUpCallbacks.callbacks?.length) {
        const cb = cleanUpCallbacks.callbacks.pop();
        cb?.();
        await ticker.delay(0.2);
      }

      this.destroy();
    }
  }

  addFlashQuad() {
    const lightning = this.addChildAt(new Sprite(Texture.WHITE), 0);
    this.context.utils.makeScreenLayer(lightning, null);
    lightning.alpha = 0;

    const tweeener = new TemporaryTweeener(lightning);
    return Object.assign(lightning, {
      playShowAnimation() {
        return tweeener.fromTo(
          this,
          {
            alpha: 0,
          },
          {
            alpha: 1,
            duration: 0.15,
            ease: "power.in",
          }
        );
      },
      playHideAnimation() {
        return tweeener.fromTo(
          this,
          {
            alpha: 1,
          },
          {
            alpha: 0,
            duration: 0.5,
            ease: "power2.out",
          }
        );
      },
    });
  }

  addStoryCinematicBackdrop() {
    const assets = GameSingletons.getResources();

    const container = new Container();
    this.slideshowViewContainer.addChild(container);

    const backdropWidth = 1000;
    const backdropHeight = 1500;

    const characterBackdropTextureId =
      this.data.characterStoryBackdropTextureId || "assets/images/cinematics/story/tile-player.png";

    const characterBackdrop = new CinematicConversationBackdrop({
      texture: assets.getTexture(characterBackdropTextureId),
      width: backdropWidth,
      height: backdropHeight,
      tileScale: 1.0,
      skew: 0.2,
      rotation: 0,
      tileSpeedX: 0.05,
      tileSpeedY: -0.25,
    });
    characterBackdrop.angle = -10;
    characterBackdrop.position.set(this.slideshowViewBounds.width * 0.0, this.slideshowViewBounds.height * 0.5);
    container.addChild(characterBackdrop);

    const playerBackdrop = new CinematicConversationBackdrop({
      texture: assets.getTexture("assets/images/cinematics/story/tile-player.png"),
      width: backdropWidth,
      height: backdropHeight,
      tileScale: 1.5,
      skew: -0.15,
      rotation: 0,
      tileSpeedX: 0.1,
      tileSpeedY: -0.2,
    });
    playerBackdrop.angle = 15;
    playerBackdrop.position.set(this.slideshowViewBounds.width * 1.15, this.slideshowViewBounds.height * 0.5);
    container.addChild(playerBackdrop);

    __window__.playerBackdrop = playerBackdrop;
    __window__.characterBackdrop = characterBackdrop;

    const backdrop = Object.assign(container, {
      playShowAnimation: async () => {
        const characterBackdropTween = this.tweeener.from(characterBackdrop, {
          pixi: { pivotY: 1400 },
          duration: 0.95,
          ease: "power.out",
        });
        const playerBackdropTween = this.tweeener.from(playerBackdrop, {
          pixi: { pivotY: 1400 },
          duration: 0.85,
          delay: 0.75,
          ease: "power.out",
        });
        await Promise.all([playerBackdropTween, characterBackdropTween]);
      },
      playHideAnimation: async () => {
        const characterBackdropTween = this.tweeener.to(characterBackdrop, {
          pixi: { pivotX: 500 },
          alpha: 0,
          duration: 0.3,
          ease: "back.in",
        });
        const playerBackdropTween = this.tweeener.to(playerBackdrop, {
          pixi: { pivotX: -500 },
          alpha: 0,
          duration: 0.3,
          delay: 0.15,
          ease: "back.in",
        });
        await Promise.all([playerBackdropTween, characterBackdropTween]);
      },
      playHideAnimationAndDestroy: async () => {
        await backdrop.playHideAnimation();
        container.destroy();
      },
    });

    return backdrop;
  }
}
