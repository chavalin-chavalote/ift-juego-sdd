import { BigNumber } from "../core/numbers/BigNumber";
import { GameEngine } from "../core/state/GameEngine";
import { createInitialGameState } from "../core/state/GameState";
import { loadEraOneCatalog } from "../data/catalog";

type Profile = "active" | "casual" | "idle";

interface ProfileResult {
  readonly profile: Profile;
  readonly firstPurchaseSeconds: number;
  readonly secondEraSeconds: number;
  readonly longestReachableWaitSeconds: number;
  readonly purchaseCount: number;
  readonly dominantUpgrade: string | null;
  readonly passed: boolean;
}

const catalog = loadEraOneCatalog();
const upgradeCatalog = Object.fromEntries(catalog.upgrades.map((upgrade) => [
  upgrade.id,
  { baseCost: upgrade.baseCost, growth: upgrade.growth, maxLevel: upgrade.maxLevel },
]));

function runProfile(profile: Profile): ProfileResult {
  const engine = new GameEngine(upgradeCatalog);
  let state = createInitialGameState();
  let firstPurchaseSeconds = -1;
  let secondEraSeconds = -1;
  let longestReachableWait = 0;
  let purchaseCount = 0;
  let secondsSincePurchase = 0;
  const upgradePurchases = new Map<string, number>();
  const totalSeconds = 24 * 60 * 60;
  const tickSeconds = profile === "active" ? 1 : profile === "casual" ? 5 : 60;
  const incomeMultiplier = profile === "active" ? 1 : profile === "casual" ? 0.8 : 0.8;
  const offlineMultiplier = profile === "active" ? 1 : profile === "casual" ? 0.8 : 0.8;

  for (let elapsed = 0; elapsed < totalSeconds; elapsed += tickSeconds) {
    const baseIncome = 1.8 * incomeMultiplier;
    state = engine.dispatch(state, { type: "add_income", amount: (baseIncome * tickSeconds * offlineMultiplier).toFixed(6) }).state;
    secondsSincePurchase += tickSeconds;

    for (const upgrade of catalog.upgrades) {
      const level = state.upgradeLevels[upgrade.id] ?? 0;
      const cost = BigNumber.from(upgrade.baseCost).mul(BigNumber.from(upgrade.growth).pow(level));
      if (BigNumber.from(state.money).cmp(cost) >= 0) {
        state = engine.dispatch(state, { type: "buy_upgrade", upgradeId: upgrade.id, quantity: 1 }).state;
        purchaseCount++;
        upgradePurchases.set(upgrade.id, (upgradePurchases.get(upgrade.id) ?? 0) + 1);
        longestReachableWait = Math.max(longestReachableWait, secondsSincePurchase);
        secondsSincePurchase = 0;
        if (firstPurchaseSeconds < 0) firstPurchaseSeconds = elapsed;
        if (secondEraSeconds < 0 && purchaseCount >= 8) secondEraSeconds = elapsed;
        break;
      }
    }
    if (secondEraSeconds >= 0) break;
  }

  const dominantEntry = [...upgradePurchases.entries()].sort((left, right) => right[1] - left[1])[0];
  const maxWaitAllowed = 15 * 60;
  return {
    profile,
    firstPurchaseSeconds,
    secondEraSeconds,
    longestReachableWaitSeconds: longestReachableWait,
    purchaseCount,
    dominantUpgrade: dominantEntry?.[0] ?? null,
    passed: longestReachableWait <= maxWaitAllowed,
  };
}

const results = (["active", "casual", "idle"] as const).map(runProfile);
console.log("Idle Farm Tycoon - balance simulator v1");
for (const result of results) {
  console.log(
    `${result.profile}: first=${result.firstPurchaseSeconds}s, era2=${result.secondEraSeconds}s, ` +
    `longestWait=${result.longestReachableWaitSeconds}s, purchases=${result.purchaseCount}, ` +
    `dominant=${result.dominantUpgrade ?? "none"}, passed=${result.passed}`,
  );
}
const failed = results.filter((result) => !result.passed);
if (failed.length > 0) {
  throw new Error(`Balance wall detected: ${failed.map((result) => result.profile).join(", ")}`);
}
