import { EnchantmentCallbacksList } from "./core/EnchantmentCallbacksList";
import { createObservableFunction } from "./core/ObservableFunction";
import { makeImitateService } from "./services/imitate";
import { makeWaitUntilService } from "./services/waitUntil";
import { makeWatchService } from "./services/watch";

function extractAddFunc<T extends { add: () => unknown }>(obj: T): T["add"] {
  return obj.add.bind(obj);
}

export class Enchantments {
  public readonly onDestroyCallbacks = new EnchantmentCallbacksList();
  public readonly onDestroy = extractAddFunc(this.onDestroyCallbacks);

  public readonly onEnterFrame = createObservableFunction();

  public readonly watch = makeWatchService(this.onEnterFrame); /// resolve on destroy
  public readonly waitUntil = makeWaitUntilService(this.onEnterFrame); /// resolve on destroy
  public readonly imitate = makeImitateService(this.onEnterFrame); /// resolve on destroy
}
