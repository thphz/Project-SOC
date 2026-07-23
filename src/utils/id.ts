/**
 * Generate a unique ID with an optional prefix.
 * Uses crypto.randomUUID() when available, falls back to Date.now + random.
 */
export function genId(prefix: string = ''): string {
  const unique =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().split('-').slice(0, 2).join('')
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return prefix ? `${prefix}_${unique}` : unique;
}

/** Counter-based sequential ID generator factory. */
export function createSequentialId(prefix: string): () => string {
  let counter = 0;
  return () => {
    counter += 1;
    return `${prefix}_${counter}`;
  };
}
