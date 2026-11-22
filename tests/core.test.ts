import { describe, expect, it } from "vitest";
import { affordableMaximum, bulkCost, levelCost } from "../src/core/economy/Economy";
import { cropNetPerSecond, chainRate } from "../src/core/economy/Production";
import { FixedStepLoop } from "../src/core/time/FixedStepLoop";
import { BigNumber } from "../src/core/numbers/BigNumber";
import { formatBigNumber } from "../src/core/numbers/format";
import { createInitialGameState } from "../src/core/state/GameState";
import { GameEngine } from "../src/core/state/GameEngine";
import { encodeSave, decodeSave } from "../src/core/save/SaveEnvelope";
import { loadEraOneCatalog } from "../src/data/catalog";
import { FarmEngine } from "../src/core/farm/FarmEngine";
import { createFarmState } from "../src/core/farm/FarmState";

const upgrade = { baseCost: "5", growth: 1.15, maxLevel: 100 };

describe("BigNumber", () => {
  it("does decimal arithmetic without native floating-point precision", () => {
    expect(BigNumber.from("0.1").add(BigNumber.from("0.2")).toString()).toBe("0.3");
  });

  it("clamps negative values and formats large values", () => {
    expect(BigNumber.from("-2").toString()).toBe("-2");
    expect(formatBigNumber(BigNumber.from("1500000"))).toBe("1.5M");
    expect(formatBigNumber(BigNumber.from("1e30"))).toBe("1e+30");
  });
});

describe("FixedStepLoop", () => {
  it("uses a fixed accumulator and catches up deterministically", () => {
    const loop = new FixedStepLoop({ fixedStepSeconds: 0.1, maxCatchUpSteps: 10 });
    let steps = 0;
    expect(loop.advance(0.25, () => { steps++; })).toBe(2);
    expect(steps).toBe(2);
    expect(loop.advance(0.05, () => { steps++; })).toBe(1);
  });

  it("rejects invalid deltas and limits catch-up", () => {
    const loop = new FixedStepLoop({ fixedStepSeconds: 1, maxCatchUpSteps: 2 });
    expect(loop.advance(-1, () => undefined)).toBe(0);
    expect(loop.advance(100, () => undefined)).toBe(2);
  });
});

describe("Economy", () => {
  it("calculates geometric level and bulk costs", () => {
    expect(levelCost(upgrade, 2).toString()).toBe("6.6125");
    const purchase = bulkCost(upgrade, 0, 10);
    expect(purchase.count).toBe(10);
    expect(purchase.cost.toString()).toBe("101.51859119026362");
  });

  it("calculates a maximum affordable by closed formula", () => {
    expect(affordableMaximum(upgrade, 0, BigNumber.from("101.51859119026362"))).toBe(10);
  });

  it("honors max level and growth of one", () => {
    expect(affordableMaximum({ ...upgrade, maxLevel: 2 }, 2, BigNumber.from("100"))).toBe(0);
    expect(bulkCost({ baseCost: "2", growth: 1, maxLevel: 5 }, 1, 25).count).toBe(4);
  });
});

describe("Production", () => {
  it("applies additive, multiplicative and era multipliers", () => {
    const result = cropNetPerSecond(
      { quantity: 4, sellPrice: "0.5", productionCost: "0.05", quality: 1, growthSeconds: 5 },
      { additiveWithinCategory: 0.25, multiplicativeBetweenCategories: 1.5, eraMultiplier: 2, globalPrestigeMultiplier: 1 },
    );
    expect(result.toString()).toBe("1.49");
  });

  it("calculates chain rates independently of visual agents", () => {
    expect(chainRate(2, 3, [1.5, 2]).toString()).toBe("18");
  });
});

describe("GameEngine", () => {
  const catalog = { tomato_quantity: upgrade };

  it("adds income and tracks historical production", () => {
    const result = new GameEngine(catalog).dispatch(createInitialGameState(), { type: "add_income", amount: "2.5" });
    expect(result.state.money).toBe("12.5");
    expect(result.state.totalProduced).toBe("2.5");
  });

  it("buys one, ten and all with real state changes", () => {
    const engine = new GameEngine(catalog);
    let state = { ...createInitialGameState(), money: "1000" };
    state = engine.dispatch(state, { type: "buy_upgrade", upgradeId: "tomato_quantity", quantity: 1 }).state;
    state = engine.dispatch(state, { type: "buy_upgrade", upgradeId: "tomato_quantity", quantity: 10 }).state;
    state = engine.dispatch(state, { type: "buy_upgrade", upgradeId: "tomato_quantity", quantity: "max" }).state;
    expect(state.upgradeLevels.tomato_quantity).toBeGreaterThan(11);
  });

  it("rejects unknown, unaffordable and negative income operations", () => {
    const engine = new GameEngine(catalog);
    expect(() => engine.dispatch(createInitialGameState(), { type: "buy_upgrade", upgradeId: "missing", quantity: 1 })).toThrow();
    expect(() => engine.dispatch(createInitialGameState(), { type: "buy_upgrade", upgradeId: "tomato_quantity", quantity: 25 })).toThrow("Insufficient");
    expect(() => engine.dispatch(createInitialGameState(), { type: "add_income", amount: "-1" })).toThrow("negative");
  });

  it("advances elapsed time with tick commands", () => {
    const state = new GameEngine(catalog).dispatch(createInitialGameState(), { type: "tick", deltaSeconds: 0.1 }).state;
    expect(state.elapsedSeconds).toBe(0.1);
  });
});

describe("Data catalog", () => {
  it("loads and validates Era 1 data", () => {
    const catalog = loadEraOneCatalog();
    expect(catalog.crops[0]?.id).toBe("tomato");
    expect(catalog.eras[0]?.index).toBe(1);
  });
});

describe("Manual farm", () => {
  it("plants, waters and advances tomatoes through the four visual stages", () => {
    const farmEngine = new FarmEngine();
    let state = createFarmState();
    state = farmEngine.dispatch(state, { type: "plant", parcelId: 0, seedCost: 0.5 }).state;
    expect(state.parcels[0]?.stage).toBe("seed");
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    expect(state.parcels[0]?.stage).toBe("sprout");
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    expect(state.parcels[0]?.stage).toBe("growing");
    state = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 5, growthSeconds: 5 }).state;
    expect(state.parcels[0]?.stage).toBe("mature");
  });

  it("harvests mature crops into stock and sells the stock", () => {
    const farmEngine = new FarmEngine();
    let state = createFarmState();
    state = farmEngine.dispatch(state, { type: "plant", parcelId: 0, seedCost: 0.5 }).state;
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    state = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 10, growthSeconds: 5 }).state;
    const harvested = farmEngine.dispatch(state, { type: "harvest", parcelId: 0, quantity: 4 });
    expect(harvested.state.stock).toBe(4);
    const sold = farmEngine.dispatch(harvested.state, { type: "sell_stock", price: 0.5 });
    expect(sold.income).toBe(2);
    expect(sold.state.stock).toBe(0);
  });

  it("does not harvest empty crops or unlock an already active parcel", () => {
    const farmEngine = new FarmEngine();
    const state = createFarmState();
    expect(farmEngine.dispatch(state, { type: "harvest", parcelId: 0, quantity: 4 }).events).toHaveLength(0);
    expect(farmEngine.dispatch(state, { type: "unlock_parcel", parcelId: 0, cost: 25 }).events).toHaveLength(0);
  });

  it("unlocks blocked parcels", () => {
    const farmEngine = new FarmEngine();
    const state = createFarmState();
    const result = farmEngine.dispatch(state, { type: "unlock_parcel", parcelId: 4, cost: 45 });
    expect(result.state.parcels[4]?.stage).toBe("empty");
  });
});

describe("Save", () => {
  it("round-trips a version 1 save", () => {
    const envelope = decodeSave(encodeSave(createInitialGameState(), 123));
    expect(envelope.version).toBe(1);
    expect(envelope.savedAt).toBe(123);
  });

  it("rejects checksum corruption and unsupported versions", () => {
    const serialized = encodeSave(createInitialGameState());
    const corrupt = serialized.replace('"money":"10"', '"money":"11"');
    expect(() => decodeSave(corrupt)).toThrow("checksum");
    expect(() => decodeSave(serialized.replace('"version":1', '"version":99'))).toThrow("Unsupported");
  });
});
