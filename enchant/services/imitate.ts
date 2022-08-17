import { Container } from "@pixi/display";
import { EnchantedInstance } from "../interfaces";

type CleanUpFunction = () => unknown;
type ITicker = {
  add: (callback: () => unknown) => CleanUpFunction;
};

export function makeImitateService(ticker: ITicker) {
  /**
   * @param condition primise will resolve the first time this returns true
   */
  function imitate<T1 extends EnchantedInstance<Container>, T2>(
    imitator: T1,
    source: T2,
    sourceKeys: (keyof (T1 | T2))[]
  ) {
    function copyPropertiesFromSourceToImitator() {
      for (const key of sourceKeys) {
        imitator[key] = source[key] as any;
      }
    }

    return ticker.add(copyPropertiesFromSourceToImitator);
  }

  return Object.assign(imitate, { _ticker: ticker });
}
