import { Container } from "@pixi/display";
import { Enchantments } from "./Enchantments";
import { EnchantableInstance } from "./interfaces";

export function enchantInstance<T extends EnchantableInstance>(target: T) {
  const $super = {
    updateTransform: target.updateTransform,
    render: target.render,
    destroy: target.destroy,
  };

  const enchantments = new Enchantments();
  const enchantedInstance = Object.assign(target, {
    __enchantedInstance__: true as true,

    enchantments,

    onEnterFrame: enchantments.onEnterFrame,

    destroy(...args: Parameters<Container["destroy"]>) {
      enchantments.onEnterFrame.clear();
      enchantments.onDestroyCallbacks.popAndCallAll(enchantedInstance);
      $super.destroy.call(target, ...args);
    },
  });

  return enchantedInstance as Container & T & typeof enchantedInstance;
}
