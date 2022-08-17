import { enchantInstance } from "./enchantInstance";
import { EnchantmentGlobals } from "./EnchantmentGlobals";
import { Enchantments } from "./Enchantments";
import { EnchantableInstance, EnchantedInstance } from "./interfaces";

type Constructor<T extends EnchantableInstance = EnchantableInstance> = (new (...args: any[]) => T) & {
  __enchanted__?: true;
};

export function Enchant<TBase extends Constructor>(TargetBase: TBase) {
  const Base = Object.assign(TargetBase, { __enchanted__: true as true });

  // @ts-ignore
  class EnchantedBase extends Base implements EnchantedInstance {
    constructor(...args: any[]) {
      super(...args);
      enchantInstance(this);
    }
  }

  type EnchantedConstructor = new (...args: ConstructorParameters<TBase>) => EnchantedInstance<InstanceType<TBase>>;

  //@ts-ignore
  return EnchantedBase as EnchantedBase & EnchantedConstructor;
}

export module Enchant {
  // function makeAnimationService(enchantments: Enchantments) {
  //   return function animate(
  //     animate: (deltaTime: number) => unknown,
  //     duration: number = 1.0,
  //     easing: (v: number) => number = (v) => v
  //   ) {
  //     return new Promise<void>((resolve) => {
  //       let elapsed = 0;
  //       const onEnterFrame = () => {
  //         elapsed += EnchantmentGlobals.timeDelta;
  //         if (elapsed >= duration) {
  //           resolve();
  //           enchantments.onRenderCallbacks.remove(onEnterFrame);
  //         } else {
  //           animate(easing(elapsed / duration));
  //         }
  //       };
  //       enchantments.onRenderCallbacks.add(onEnterFrame);
  //     });
  //   };
  // }
  // export function WithAnimations<TBase extends Constructor>(TargetBase: TBase) {
  //   abstract class EnchantedBaseWithAnimations extends Enchant(TargetBase) {
  //     public readonly enchantments = Object.assign(
  //       (this as any).enchantments as Enchantments,
  //       {
  //         animate: makeAnimationService((this as any).enchantments),
  //       }
  //     );
  //   }
  //   return EnchantedBaseWithAnimations;
  // }
}
