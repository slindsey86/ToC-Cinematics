import type { Container, DisplayObject, IDestroyOptions } from "@pixi/display";
import { enchantInstance } from "./enchantInstance";
import type { Enchantments } from "./Enchantments";

export type EnchantableInstance = Pick<DisplayObject, "updateTransform" | "render" | "destroy">;

export type EnchantedInstance<T extends EnchantableInstance = EnchantableInstance> = T &
  ReturnType<typeof enchantInstance>;
