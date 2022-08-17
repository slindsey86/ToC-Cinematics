// type ObjectWithOnEnterFrameAndChildren = {
//   onEnterFrame?: () => void;
//   children?: Iterable<ObjectWithOnEnterFrameAndChildren>;
// };

type ObjectWithOnEnterFrameAndChildren = any;

export function callOnEnterFrameRecursively(target: Partial<ObjectWithOnEnterFrameAndChildren>) {
  if (target.onEnterFrame) {
    target.onEnterFrame.call(target);
  }
  if (target.children) {
    for (const child of target.children) {
      callOnEnterFrameRecursively(child);
    }
  }
}
