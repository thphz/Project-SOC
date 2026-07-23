/**
 * Return a random integer in [min, max] (inclusive).
 */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Return a random float in [min, max).
 */
export function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Apply jitter around a base value: result = base + rand(-amplitude, +amplitude).
 * Clamped to [min, max] if provided.
 */
export function jitter(
  base: number,
  amplitude: number,
  min?: number,
  max?: number
): number {
  const delta = randFloat(-amplitude, amplitude);
  const result = base + delta;
  return clamp(result, min ?? result, max ?? result);
}

/**
 * Clamp a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Pick a random element from an array.
 */
export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Return true with the given probability (0-1).
 */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Return a random value between base - jitter and base + jitter,
 * clamped to [min, max].
 */
export function jitterClamped(
  base: number,
  amplitude: number,
  min: number,
  max: number
): number {
  const value = base + randFloat(-amplitude, amplitude);
  return clamp(value, min, max);
}
