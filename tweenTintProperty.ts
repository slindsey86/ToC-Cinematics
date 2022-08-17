import { DestroyableDisplayObject, TemporaryTweeener } from "./TemporaryTweener";
import { Color } from "./Color";

export type IWithTint = DestroyableDisplayObject & { tint: number };

export function tweenTintProperty(
  target: IWithTint,
  color: Color | number,
  vars?: gsap.TweenVars | number,
  tweeener = new TemporaryTweeener(target)
) {
  if (typeof vars == "number") vars = { duration: vars };
  if (typeof color == "number") color = new Color(color);

  const colorStart = new Color(target.tint);

  return tweeener.to(colorStart, {
    overwrite: "auto",
    ease: "power2.inOut",
    r: color.r,
    g: color.g,
    b: color.b,
    ...vars,
    onUpdate: () => {
      target.tint = colorStart.toInt();
    },
  });
}

export module tweenTintProperty {
  export function makeServiceMethod(
    target: IWithTint,
    vars?: gsap.TweenVars | number,
    tweeener = new TemporaryTweeener(target)
  ) {
    const defaultVars = typeof vars == "number" ? { duration: vars } : vars;

    const colorStart = new Color(target.tint);
    const colorFinal = new Color(target.tint);

    return (color: Color | number, vars?: gsap.TweenVars | number) => {
      colorStart.setFromInteger(target.tint);

      if (typeof color == "number") {
        colorFinal.setFromInteger(color);
      } else {
        colorFinal.copyFrom(color);
      }

      vars = typeof vars == "number" ? { duration: vars } : vars;

      return tweeener.to(colorStart, {
        overwrite: "auto",
        ease: "power2.inOut",
        r: colorFinal.r,
        g: colorFinal.g,
        b: colorFinal.b,
        ...defaultVars,
        ...vars,
        onUpdate: () => {
          target.tint = colorStart.toInt();
        },
      });
    };
  }
}
