let timeDelta = 0;
let timeTotal = performance.now();

let framesTotal = 0;

function startEnterFrameLoop() {
  function onEnterFrame() {
    const timeNow = performance.now() * 0.001;
    timeDelta = timeNow - timeTotal;
    timeTotal = timeNow;
    framesTotal++;
    requestAnimationFrame(onEnterFrame);
  }
  onEnterFrame();
}

startEnterFrameLoop();

export const EnchantmentGlobals = {
  get timeDelta60() {
    return timeDelta * 60;
  },
  get timeDelta() {
    return timeDelta;
  },
  get timeTotal() {
    return timeTotal;
  },
  get framesTotal() {
    return framesTotal;
  },
};
