import { createObservableFunction } from "../core/ObservableFunction";

export function addOnEnterFrame<T extends {}>(target: T) {
  return Object.assign(target, {
    onEnterFrame: createObservableFunction.call(target),
  });
}
