import { Ticker as PixiTicker, TickerCallback, UPDATE_PRIORITY } from "@pixi/ticker";
import { CallbackList } from "./CallbackList";

type Falsy = false | 0 | "" | null | undefined;
type Truthy<T> = T extends boolean ? true : T extends Falsy ? never : NonNullable<T>;

export function createTicker() {
  const tickerBase = PixiTicker.shared;
  const originalAdd = tickerBase.add.bind(tickerBase);

  const ticker = Object.assign(tickerBase, {
    add<T = any>(fn: TickerCallback<T>, context?: T | undefined, priority?: UPDATE_PRIORITY | undefined) {
      originalAdd(fn, context, priority);
      return () => void tickerBase.remove(fn, context);
    },
    get currentFPS() {
      return tickerBase.FPS;
    },

    nextFrame() {
      return new Promise<void>(resolve => {
        tickerBase.addOnce(() => resolve());
      });
    },
    delayFrames(framesCount: number) {
      return new Promise<void>(resolve => {
        function oef() {
          if (--framesCount === 0) {
            resolve();
            tickerBase.remove(oef);
          }
        }
        tickerBase.add(oef);
      });
    },

    delay(seconds: number) {
      const targetTime = ticker.lastTime + (seconds * 1000) / ticker.speed;
      return new Promise<void>(resolve => {
        const onEnterFrame = () => {
          if (ticker.lastTime >= targetTime) {
            ticker.remove(onEnterFrame);
            resolve();
          }
        };
        ticker.add(onEnterFrame);
      });
    },
    delayInterruptableByClick(seconds: number) {
      const targetTime = ticker.lastTime + (seconds * 1000) / ticker.speed;
      return new Promise<void>(resolve => {
        let interrupted = false;
        function interrupt() {
          console.log(`🐁 Delay interrupted by click`);
          interrupted = true;
        }
        document.addEventListener("click", interrupt);

        const onEnterFrame = () => {
          if (interrupted || ticker.lastTime >= targetTime) {
            document.removeEventListener("click", interrupt);
            ticker.remove(onEnterFrame);
            resolve();
          }
        };
        ticker.add(onEnterFrame);
      });
    },

    __onEnterFrameUniqueWhile_register: new Array<Function>(),
    onEnterFrameUniqueWhile<T>(fn: (this: T) => unknown, condition: (this: T) => boolean, context: T) {
      function oef() {
        if (condition.call(context)) {
          fn.call(context);
        } else {
          end();
        }
      }
      const end = () => {
        ticker.remove(oef);
        const index = ticker.__onEnterFrameUniqueWhile_register.indexOf(oef);
        if (index !== -1) {
          ticker.__onEnterFrameUniqueWhile_register.splice(index, 1);
        }
      };
      this.__onEnterFrameUniqueWhile_register.push(fn);
      ticker.add(oef);
      return end;
    },

    createSimpleTween(fn: (progress: number) => unknown, duration: number = 1.0) {
      const onFinished = new CallbackList();
      let progress = 0;
      function onFrame() {
        progress += (ticker.deltaMS * 0.001) / duration;
        if (progress >= 1) {
          progress = 1.0;
          clear();
        }
        fn(progress);
      }
      function clear() {
        stopLoop();
        onFinished.callAllAndClear();
      }
      const stopLoop = this.add(onFrame);
      const result = {
        then(fn: () => unknown) {
          onFinished.add(fn);
          return result;
        },
        stop(fastForward = false) {
          if (fastForward) this.fastForward();
          else clear();
        },
        fastForward() {
          progress = 1.0;
          fn(progress);
        },
      };
      return result;
    },
  });

  return ticker;
}

export type Ticker = ReturnType<typeof createTicker>;
