import { formatBigNumber } from "../core/numbers/format";
import { BigNumber } from "../core/numbers/BigNumber";
import { createInitialGameState } from "../core/state/GameState";
import { GameEngine } from "../core/state/GameEngine";
import { cropNetPerSecond } from "../core/economy/Production";
import { loadEraOneCatalog } from "../data/catalog";

const catalog = loadEraOneCatalog();
const upgradeCatalog = Object.fromEntries(catalog.upgrades.map((upgrade) => [
  upgrade.id,
  { baseCost: upgrade.baseCost, growth: upgrade.growth, maxLevel: upgrade.maxLevel },
]));
const engine = new GameEngine(upgradeCatalog);
const tomato = catalog.crops[0];
if (!tomato) throw new Error("Era 1 tomato data is missing");

let state = createInitialGameState();
const purchases: Array<{ seconds: number; upgradeId: string }> = [];
const maxSeconds = 30 * 60;
const fixedStep = 1;

for (let elapsed = 0; elapsed < maxSeconds; elapsed += fixedStep) {
  const income = cropNetPerSecond(
    {
      quantity: tomato.quantityPerCycle,
      sellPrice: tomato.sellPrice,
      productionCost: tomato.productionCost,
      quality: 1,
      growthSeconds: tomato.growthSeconds,
    },
    { additiveWithinCategory: 0, multiplicativeBetweenCategories: 1, eraMultiplier: 1, globalPrestigeMultiplier: 1 },
  );
  state = engine.dispatch(state, { type: "tick", deltaSeconds: fixedStep }).state;
  state = engine.dispatch(state, { type: "add_income", amount: income.mul(BigNumber.from(fixedStep)).toString() }).state;

  for (const upgrade of catalog.upgrades) {
    const level = state.upgradeLevels[upgrade.id] ?? 0;
    const firstCost = BigNumber.from(upgrade.baseCost).mul(BigNumber.from(upgrade.growth).pow(level));
    if (BigNumber.from(state.money).cmp(firstCost) >= 0) {
      state = engine.dispatch(state, { type: "buy_upgrade", upgradeId: upgrade.id, quantity: 1 }).state;
      purchases.push({ seconds: elapsed, upgradeId: upgrade.id });
    }
  }
}

console.log("Idle Farm Tycoon - balance simulator v0 (activo)");
console.log(`Simulated: ${maxSeconds / 60} minutes`);
console.log(`Money: ${formatBigNumber(BigNumber.from(state.money))}`);
console.log(`Production total: ${formatBigNumber(BigNumber.from(state.totalProduced))}`);
console.log("Purchases:");
for (const purchase of purchases.slice(0, 20)) {
  console.log(`  ${purchase.seconds}s  ${purchase.upgradeId}`);
}
