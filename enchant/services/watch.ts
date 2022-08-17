type Falsy = false | 0 | "" | null | undefined;
type Truthy<T> = T extends Falsy ? never : NonNullable<T>;

type CleanUpFunction = () => unknown;
type ITicker = {
  add: (callback: () => unknown) => CleanUpFunction;
};

export function makeWatchService(ticker: ITicker) {
  /**
   * @param getValue - A function, which will be called every frame,
   * and its value compared to the value from the previous frame.
   *
   * @param onChange - A function, which will be called when the
   * value from the current frame is different from the previous one.
   * The new and old value will be passed to the function as arguments.
   *
   * @param shouldMakeInitialCall - If true, the `onChange` function will
   * also be called once immediately when you called this function.
   * Otherwise, the `onChange` function will be called only from the next
   * time the `getValue` function returns a different value forward.
   *
   * @returns a cleanup function. Call it to stop watching.
   */
  function watch<T>(getValue: () => T, onChange: (newValue: T, oldValue: T) => any, shouldMakeInitialCall = false) {
    let prevValue = getValue();
    shouldMakeInitialCall && onChange(prevValue, prevValue);
    function performValueCheck() {
      const newValue = getValue();
      if (prevValue !== newValue) {
        try {
          onChange(newValue, prevValue);
        } catch (e) {
          console.error(e);
        } finally {
          prevValue = newValue;
        }
      }
    }
    return ticker.add(performValueCheck);
  }

  function watchArray<T extends readonly unknown[]>(
    getValues: () => Readonly<T>,
    onChange: (newValues: T, oldValues: T, changeFlags: { [K in keyof T]: boolean }) => any,
    shouldMakeInitialCall = false
  ) {
    const prevValues = [...getValues()] as unknown as T;
    shouldMakeInitialCall && onChange(prevValues, prevValues, new Array(prevValues.length).fill(true) as any);
    const compare = (value: T[number], i: number) => value !== prevValues[i];
    return ticker.add(function observeArrayFunc() {
      const newValues = getValues();
      if (newValues.some(compare)) {
        onChange(newValues, prevValues, newValues.map(compare) as any);
        Object.assign(prevValues, newValues);
      }
    });
  }

  function watchProperties<T extends {}>(
    getValues: () => Readonly<T>,
    onChange: (newValues: Readonly<T>, oldValues: Readonly<T>) => any,
    shouldMakeInitialCall = false
  ) {
    const prevValues = { ...getValues() };
    shouldMakeInitialCall && onChange(prevValues, prevValues);
    return ticker.add(function observePropertiesFunc() {
      const newValues = getValues();
      if (Object.entries(newValues).some(([key, value]) => value !== prevValues[key as keyof T])) {
        onChange(newValues, prevValues);
        Object.assign(prevValues, newValues);
      }
    });
  }

  /**
   * Works like a regular observe function for booleans, with the following exceptions:
   * - multiple value change handlers can be given
   * - if the value changes to truthy, the handlers are called they would by a regular
   *   observe function. However, if it is falsy, then all the cleanup functions returned
   *   by those handler from a previous truth state will be called instead.
   * - 'shouldMakeInitialCall' is effectively always true when using 'observe.andCleanup()'
   *
   * You may use this helper function to
   * - Add and remove an element on the screen whenever a condition is met
   * - Start and stop certain loops depending on a flag value, such as if dependent element
   *   is visible on the screen
   * - etc.
   *
   * @param getFlag
   * @param handlers
   * @returns
   */
  function watchAndCleanup<T = boolean>(
    getValue: () => T,
    ...handlers: ((newValue: Truthy<T>) => (v?: T) => unknown)[]
  ) {
    const cleanup = [] as ((v?: T) => unknown)[];
    let prevValue = getValue();

    const triggerHandlers = (value: Truthy<T>) => cleanup.push(...handlers.map(f => f(value)));
    const cleanupAfterHandlers = (newValue: T) => {
      cleanup.forEach(f => f(newValue));
      cleanup.length = 0;
    };

    !!prevValue === true && triggerHandlers(prevValue as Truthy<T>);

    function observeAndCleanupFunc() {
      const newValue = getValue();
      if (prevValue !== newValue) {
        try {
          cleanupAfterHandlers(newValue);
          newValue && triggerHandlers(newValue as Truthy<T>);
        } catch (e) {
          console.error(e);
        } finally {
          prevValue = newValue;
        }
      }
    }
    const stopLoop = ticker.add(observeAndCleanupFunc);

    return (skipHandlersCleanup = false) => {
      stopLoop();
      !skipHandlersCleanup && cleanupAfterHandlers(prevValue);
    };
  }

  /** Log value returned by method whenever it changes */
  function watchAndLog<T>(getValue: () => T, process: (value: T) => unknown = v => v) {
    let newValue: T;
    let prevValue: T = getValue();
    console.log(process(prevValue));
    return ticker.add(() => prevValue !== (newValue = getValue()) && console.log(process((prevValue = newValue))));
  }

  return Object.assign(watch, {
    _ticker: ticker,
    array: watchArray,
    properties: watchProperties,
    andCleanup: watchAndCleanup,
    log: watchAndLog,
  });
}
