type Falsy = false | 0 | "" | null | undefined;
type Truthy<T> = T extends Falsy ? never : NonNullable<T>;

type CleanUpFunction = () => unknown;
type ITicker = {
  add: (callback: () => unknown) => CleanUpFunction;
};

export function makeWaitUntilService(ticker: ITicker) {
  /**
   * @param condition primise will resolve the first time this returns true
   */
  function waitUntil<T = boolean>(condition: () => T, onTruthy?: (value: T) => void) {
    return new Promise<Truthy<T>>(resolve => {
      const fn = function onWaitUntilEnterFrame() {
        const result = condition();
        if (!!result) {
          onTruthy?.(result as Truthy<T>);
          resolve(result as Truthy<T>);
          cleanup();
        }
      };
      const cleanup = ticker.add(fn);
      fn();
    });
  }

  function orCancel<T>(condition: () => T, onTruthy: (value: Truthy<T>) => unknown) {
    let cancel = null as null | Function;
    new Promise<Truthy<T>>(resolve => {
      cancel = ticker.add(function onWaitUntilEnterFrame() {
        const result = condition();
        if (!!result) {
          resolve(result as Truthy<T>);
          cancel!();
        }
      });
    }).then(onTruthy);
    return cancel as () => void;
  }

  /**
   * @param condition primise will resolve the first time this returns true
   * @param timeout in seconds
   *
   * @return
   */
  function orTimeout<T = boolean>(condition: () => T, timeout: number = 1.0) {
    return new Promise<T>((resolve, reject) => {
      let error: Error | null = null;
      setTimeout(() => (error = new Error(`Timed out`)), timeout * 1000);
      const cleanup = ticker.add(function onWaitUntilOrTimeoutEnterFrame() {
        try {
          if (error) throw error;
          const result = condition();
          if (!!result) {
            resolve(result as T);
            cleanup();
          }
        } catch (error) {
          reject(error as Error);
          cleanup();
        }
      });
    });
  }

  /**
   * @param condition primise will resolve the first time this returns a truthy value
   * Additionally, if it returns an error object, it will immediaely be thrown
   */
  function orThrowError<T = boolean>(condition: () => T | Error) {
    return new Promise<Truthy<T>>((resolve, reject) => {
      const cleanup = ticker.add(function onWaitUntilOrThrowErrorEnterFrame() {
        const result = condition();
        if (!!result) {
          if (result instanceof Error) {
            // console.warn(`will throw error!!!!`)
            reject(result);
          } else {
            resolve(result as Truthy<T>);
          }
          cleanup();
        }
      });
    });
  }

  return Object.assign(waitUntil, {
    _ticker: ticker,
    orCancel: orCancel,
    orTimeout: orTimeout,
    orThrowError: orThrowError,
  });
}
