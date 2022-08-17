
import { Renderer } from '@pixi/core';
import { Application, IApplicationOptions } from '@pixi/app';
import "@pixi/events";
import { InteractionManager } from '@pixi/interaction';
Renderer.registerPlugin('interaction', InteractionManager);
import { BatchRenderer } from '@pixi/core';
Renderer.registerPlugin('batch', BatchRenderer);
import { AppLoaderPlugin } from '@pixi/loaders';
Application.registerPlugin(AppLoaderPlugin);
import { Loader } from '@pixi/loaders';
import { SpritesheetLoader } from '@pixi/spritesheet';
Loader.registerPlugin(SpritesheetLoader);
import { createTicker } from "./ticker";
import { Ticker } from '@pixi/ticker';
import '@pixi/math-extras';
import { app } from '.';
import { AssetsManager } from './assets-manager';
import { ViewSize } from "./ViewSize"
import { SimpleObjectsFactory } from './SimpleObjectsFactory';
const APP_DIV_ID = "app";

export function boot(applicationOptions: Partial<IApplicationOptions> = {}) {
  const parentElement = document.getElementById(APP_DIV_ID) ?? document.body;

  const app = new Application({
    backgroundColor: 0x0f1f2f,
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
  
  ticker.add(() => app.render());
  ticker.start();

  document.body.appendChild(app.view);

  return uninitializedContext;
}



export type UninitializedGameContext = ReturnType<typeof boot>;

export type GameContext = {
  readonly [K in keyof UninitializedGameContext]: NonNullable<UninitializedGameContext[K]>;
};