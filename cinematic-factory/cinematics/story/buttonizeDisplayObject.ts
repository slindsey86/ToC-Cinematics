import { DisplayObject } from "@pixi/display";
import { InteractionEvent } from "@pixi/interaction";

export function buttonizeDisplayObject<T extends DisplayObject>(
  target: T,
  callbacksOrFunction: ((this: T) => void) | { onTrigger?: (this: T) => void }
) {
  const callbacks = callbacksOrFunction instanceof Function ? { onTrigger: callbacksOrFunction } : callbacksOrFunction;

  target.interactive = true;
  target.buttonMode = true;

  function onPointerDown(this: T, event: InteractionEvent) {
    /**
     * Remember the pointer's starting global position
     */
    const startingPosition = event.data.global.clone();

    /**
     * Listen for pointer up and if the pointer has not moved more than 10 pixels and the pinter is still over the target, trigger the callback.
     */
    this.on("pointerup", onPointerUp);

    function onPointerUp(this: T, event: InteractionEvent) {
      /**
       * Stop listening for pointer up
       */
      this.off("pointerup", onPointerUp);

      const delta = startingPosition.subtract(event.data.global);

      /**
       * If the pointer has moved more than 10 pixels, ignore the click
       */
      if (delta.magnitude() > 10) return;

      callbacks.onTrigger?.call(this);
    }
  }

  target.on("pointerdown", onPointerDown);

  /**
   * Clean up function to remove any events added by `buttonizeDisplayObject()`.
   */
  function cleanUp() {
    target.interactive = false;
    target.buttonMode = false;
    target.off("pointerdown", onPointerDown);
  }

  return Object.assign(cleanUp, { callbacks });
}
