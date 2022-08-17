import { Container } from "@pixi/display";
import { Sprite } from "@pixi/sprite";
import { Text } from "@pixi/text";
import { Enchant } from "./enchant/Enchant";

export const EnchantedContainer = Enchant(Container);
export const EnchantedSprite = Enchant(Sprite);
export const EnchantedText = Enchant(Text);
