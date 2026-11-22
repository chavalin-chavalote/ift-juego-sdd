export interface MultiplierSet {
  readonly additive: Readonly<Record<string, readonly number[]>>;
  readonly multiplicative: Readonly<Record<string, number>>;
  readonly global: readonly number[];
}

export function resolveMultipliers(set: MultiplierSet): number {
  let result = 1;
  for (const category of Object.keys(set.additive)) {
    const values = set.additive[category] ?? [];
    result *= 1 + values.reduce((sum, value) => sum + value, 0);
  }
  for (const category of Object.keys(set.multiplicative)) {
    result *= set.multiplicative[category] ?? 1;
  }
  for (const multiplier of set.global) result *= multiplier;
  return result;
}
