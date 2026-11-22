import { BigNumber } from "../numbers/BigNumber";

export interface CropConfig {
  readonly quantity: number;
  readonly sellPrice: string;
  readonly productionCost: string;
  readonly quality: number;
  readonly growthSeconds: number;
}

export interface ProductionMultipliers {
  readonly additiveWithinCategory: number;
  readonly multiplicativeBetweenCategories: number;
  readonly eraMultiplier: number;
  readonly globalPrestigeMultiplier: number;
}

export function cropNetPerSecond(crop: CropConfig, multipliers: ProductionMultipliers): BigNumber {
  const revenue = BigNumber.from(crop.sellPrice)
    .mul(BigNumber.from(crop.quantity * crop.quality))
    .mul(BigNumber.from(1 + multipliers.additiveWithinCategory))
    .mul(BigNumber.from(multipliers.multiplicativeBetweenCategories))
    .mul(BigNumber.from(multipliers.eraMultiplier))
    .mul(BigNumber.from(multipliers.globalPrestigeMultiplier));
  const cost = BigNumber.from(crop.productionCost);
  return revenue.sub(cost).div(BigNumber.from(crop.growthSeconds));
}

export function chainRate(baseRate: number, level: number, multipliers: readonly number[]): BigNumber {
  let rate = BigNumber.from(baseRate).mul(BigNumber.from(level));
  for (const multiplier of multipliers) rate = rate.mul(BigNumber.from(multiplier));
  return rate;
}
