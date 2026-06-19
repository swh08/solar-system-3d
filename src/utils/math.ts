export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function wrapIndex(index: number, length: number): number {
  return ((index % length) + length) % length;
}
