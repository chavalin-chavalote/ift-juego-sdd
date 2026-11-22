export type UpgradeEffect =
  | { readonly type: "quantity_multiplier"; readonly value: number }
  | { readonly type: "growth_speed"; readonly value: number }
  | { readonly type: "sell_price_multiplier"; readonly value: number }
  | { readonly type: "quality_multiplier"; readonly value: number }
  | { readonly type: "storage_multiplier"; readonly value: number }
  | { readonly type: "transport_efficiency"; readonly value: number };

export function applyUpgradeEffect(effect: UpgradeEffect, level: number, base: number): number {
  if (!Number.isInteger(level) || level < 0) throw new Error("Invalid effect level");
  switch (effect.type) {
    case "quantity_multiplier":
    case "sell_price_multiplier":
    case "quality_multiplier":
    case "storage_multiplier":
      return base * (1 + effect.value * level);
    case "transport_efficiency":
      return base * Math.max(0.1, 1 - effect.value * level);
    case "growth_speed":
      return base * Math.max(0.25, 1 - effect.value * level);
  }
}
