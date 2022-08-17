export function lerp<T extends number>(from: T, to: T, frac: T) {
  return from + (to - from) * frac;
}

export function lerpClamped<T extends number>(from: T, to: T, frac: T) {
  if (frac < 0) return from;
  if (frac > 1) return to;
  return from + (to - from) * frac;
}

export function unlerp<T extends number>(from: T, to: T, value: T) {
  return (value - from) / (to - from) || 0.0;
}

export function unlerpClamped<T extends number>(from: T, to: T, value: T) {
  if (value < from) return 0;
  if (value > to) return 1;
  return (value - from) / (to - from) || 0.0;
}

export function clamp<T extends number>(value: T, min: T, max: T) {
  return value <= min ? min : value >= max ? max : (value as T);
}

export function loop<T extends number>(value: T, min: T, max: T) {
  return min + loopFromZero(value, max - min);
}

export function loopFromZero<T extends number>(value: T, max: T) {
  value = (value % max) as T;
  return value < 0 ? value + max : value;
}

export function yoyo<T extends number>(value: T, max: T) {
  const back = Math.floor(value / max) % 2 === 1;
  return back ? max - (value % max) : value % max;
}

export function sum<T extends number>(...values: T[]) {
  return values.reduce<T>((a, c) => (a + c) as T, 0 as T);
}

export function signFrom<T extends number>(signSource: T, target: T = 1.0 as T) {
  return signSource >= 0 === target >= 0 ? target : -target;
}

export function maxAbs<T extends number>(...values: T[]) {
  const _ = 0 as T;
  return values.reduce((a, c) => (Math.abs(c) > Math.abs(a) ? c : a), _);
}

export function minAbs<T extends number>(...values: T[]) {
  const _ = Number.POSITIVE_INFINITY as T;
  return values.reduce((a, c) => (Math.abs(c) < Math.abs(a) ? c : a), _);
}

export function roundTo<T extends number>(value: T, step: T) {
  return Math.round(value / step) * step;
}

export function splitNumberByWeights<T extends number>(value: T, weights: T[], total: T = sum(...weights)) {
  return weights.map(weight => (value * weight) / total);
}
