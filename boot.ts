import { Renderer, Texture } from '@pixi/core';
import { Application, IApplicationOptions } from '@pixi/app';
import "@pixi/events";
import { Loader } from '@pixi/loaders';
import { SpritesheetLoader } from '@pixi/spritesheet';
import { createTicker } from "./ticker";
import '@pixi/math-extras';
import { AssetsManager, assetsNamed, assetsUnnamed } from './assets-manager';
import { ViewSize } from "./ViewSize"
import { SimpleObjectsFactory } from './SimpleObjectsFactory';
import { TextureCache } from '@pixi/utils';
const APP_DIV_ID = "app";

export function boot(applicationOptions: Partial<IApplicationOptions> = {}) {
  const parentElement = document.getElementById(APP_DIV_ID) ?? document.body;
  const loader = Loader.shared;

  const app = new Application({
    backgroundColor: 0x000000,
    resolution: window.devicePixelRatio || 1,
    resizeTo: parentElement,
    autoDensity: true,
    antialias: true,
    sharedTicker: true,
    autoStart: true,
    ...applicationOptions
  });
  const viewSize = new ViewSize();
  const ticker = createTicker();
  const assets = new AssetsManager();
  const uninitializedContext = {
    app,
    assets,
    simpleFactory: new SimpleObjectsFactory(assets),
    ticker,
    viewSize
  }
  document.body.appendChild(app.view);
  
  ticker.add(() => app.render());
  ticker.start();
  app.ticker = ticker;
  
  async function loadGameAssets() {
    try {
      const resources1 = await uninitializedContext.assets.load(assetsNamed);
      const resources2 = await uninitializedContext.assets.load(assetsUnnamed);
      Object.assign(loader.resources, resources1, resources2);
    } catch (error) {
      throw new Error(`Failed to load assets: ${error}`);
    }

    for (const [id, { texture, textures }] of Object.entries(loader.resources)) {
      if (!textures && texture && !TextureCache[id]) {
        Texture.addToCache(texture, id);
        console.warn(`Texture ${id} was not in cache, but I fixed that for you`);
      }
    }
  }
const load = async function () {
  await loadGameAssets()
}
load().catch(error => alert(`Error during game boot:\n${error.message}`));;

  return uninitializedContext;
}

export type UninitializedGameContext = ReturnType<typeof boot>;

export type GameContext = {
  readonly [K in keyof UninitializedGameContext]: NonNullable<UninitializedGameContext[K]>;
};