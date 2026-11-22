import { BigNumber } from "../numbers/BigNumber";

export interface UpgradeCostConfig {
  readonly baseCost: string;
  readonly growth: number;
  readonly maxLevel: number;
}

export function levelCost(config: UpgradeCostConfig, level: number): BigNumber {
  if (!Number.isInteger(level) || level < 0) throw new Error("Invalid upgrade level");
  return BigNumber.from(config.baseCost).mul(BigNumber.from(config.growth).pow(level));
}

export function bulkCost(config: UpgradeCostConfig, currentLevel: number, quantity: number): { cost: BigNumber; count: number } {
  if (!Number.isInteger(quantity) || quantity < 1) return { cost: BigNumber.zero(), count: 0 };
  const growth = config.growth;
  const availableCount = Math.min(quantity, config.maxLevel - currentLevel);
  if (availableCount <= 0) return { cost: BigNumber.zero(), count: 0 };

  if (growth === 1) {
    return { cost: levelCost(config, currentLevel).mul(BigNumber.from(availableCount)), count: availableCount };
  }
  const geometricMultiplier = (growth ** availableCount - 1) / (growth - 1);
  return {
    cost: levelCost(config, currentLevel).mul(BigNumber.from(geometricMultiplier)),
    count: availableCount,
  };
}

export function affordableMaximum(config: UpgradeCostConfig, currentLevel: number, money: BigNumber): number {
  const availableLevels = config.maxLevel - currentLevel;
  if (availableLevels <= 0) return 0;
  if (config.growth === 1) {
    return Math.max(0, Math.min(availableLevels, Math.floor(money.div(levelCost(config, currentLevel)).toDecimal().toNumber())));
  }

  const base = levelCost(config, currentLevel);
  const g = config.growth;
  const threshold = money.mul(BigNumber.from(g - 1)).div(base).add(BigNumber.from(1)).toDecimal();
  if (threshold.lte(1)) return 0;
  const count = Math.floor(Math.log(threshold.toNumber()) / Math.log(g));
  return Math.max(0, Math.min(availableLevels, count));
}
