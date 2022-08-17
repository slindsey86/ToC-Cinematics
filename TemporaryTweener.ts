import { gsap } from "gsap/gsap-core";
import { DisplayObject } from "@pixi/display";

export type DestroyableDisplayObject = Pick<DisplayObject, "destroy" | "destroyed" | "addListener" | "removeListener">;

export type TweenTarget = null | (gsap.TweenTarget & { destroyed?: boolean });

/**
 * Currently simply wraps GSAP's native functions for tweening object properties,
 * with the added benefit of destroying any queued up tweens when the object given
 * to the contructor ("sustainer") is destroyed.
 */
export class TemporaryTweeener<T extends DestroyableDisplayObject = DestroyableDisplayObject> {
  private readonly onDestroyFunctions = new Set<() => unknown>();

  private onSustainerDestroyed(fn: () => unknown) {
    this.onDestroyFunctions.add(fn);
  }

  constructor(sustainer: T) {
    const cleanUp = () => {
      const fns = [...this.onDestroyFunctions];
      this.onDestroyFunctions.clear();
      fns.forEach(fn => fn());
      sustainer.removeListener("removed", cleanUp);
    };
    sustainer.addListener("removed", cleanUp);
  }

  public onEveryFrame(cb: () => void | null) {
    function wrapped() {
      try {
        cb();
      } catch (error) {
        console.error(`TemporaryTweeener.onEveryFrame() errored out:\n${error}`);
        gsap.ticker.remove(wrapped);
      }
    }
    gsap.ticker.add(wrapped);
    this.onDestroyFunctions.add(() => gsap.ticker.remove(wrapped));
  }

  public registerForDestruction<T extends gsap.core.Animation>(tween: T): T {
    this.onSustainerDestroyed(() => tween.kill());
    return tween;
  }

  public readonly quickTo = <T extends TweenTarget>(target: T, property: keyof T, vars?: gsap.TweenVars) => {
    const fn = gsap.quickTo(target, String(property), vars);
    return (value: number, start?: number, startIsRelative?: boolean) => {
      if (!target || target.destroyed) return Promise.resolve();
      return this.registerForDestruction(fn(value, start, startIsRelative));
    };
  };

  public readonly to = (targets: TweenTarget, vars: gsap.TweenVars) => {
    if (!targets || targets.destroyed) return Promise.resolve();
    return this.registerForDestruction(gsap.to(targets, vars));
  };

  public readonly from = (targets: TweenTarget, vars: gsap.TweenVars) => {
    if (!targets || targets.destroyed) return Promise.resolve();
    return this.registerForDestruction(gsap.from(targets, vars));
  };

  public readonly fromTo = (targets: TweenTarget, fromVars: gsap.TweenVars, toVars: gsap.TweenVars) => {
    if (!targets || targets.destroyed) return Promise.resolve();
    return this.registerForDestruction(gsap.fromTo(targets, fromVars, toVars));
  };

  public readonly createTimeline = (vars?: gsap.TimelineVars | undefined) => {
    return this.registerForDestruction(gsap.timeline(vars));
  };

  public readonly playTimeline = (fn: (tl: gsap.core.Timeline) => unknown, vars?: gsap.TimelineVars | undefined) => {
    const tl = this.createTimeline(vars);
    fn(tl);
    return tl.play();
  };

  public readonly delay = (seconds: number) => {
    return new Promise(resolve => gsap.delayedCall(seconds, resolve));
  };

  public readonly add = (fn: gsap.TickerCallback) => {
    gsap.ticker.add(fn);
    const kill = () => gsap.ticker.remove(fn);
    this.onSustainerDestroyed(kill);
    return Object.assign(() => true, { kill });
  };

  public readonly remove = (fn: gsap.TickerCallback) => {
    return gsap.ticker.remove(fn);
  };

  public killTweensOf(...args: any[]) {
    // @ts-ignore
    return gsap.killTweensOf(...args);
  }
}

export module TemporaryTweeener {
  export function withTweeener<T extends DisplayObject>(sustainer: T) {
    return Object.assign(sustainer, { tweeener: new TemporaryTweeener(sustainer) });
  }
}
