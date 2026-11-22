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
import { resolveMultipliers } from "../src/core/economy/Multipliers";
import { maintenancePerSecond, netIncome } from "../src/core/economy/Maintenance";
import { applyUpgradeEffect } from "../src/core/economy/UpgradeEffects";

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

describe("F03 multipliers and economy safeguards", () => {
  it("adds within categories before applying multiplicative categories and globals", () => {
    const result = resolveMultipliers({
      additive: { speed: [0.2, 0.1], quality: [0.5] },
      multiplicative: { era: 2, machinery: 1.5 },
      global: [0.8],
    });
    expect(result).toBeCloseTo(1.3 * 1.5 * 2 * 1.5 * 0.8);
  });

  it("clamps maintenance-negative income to zero", () => {
    const maintenance = maintenancePerSecond([{ buildingCost: "100", rate: 0.02 }]);
    expect(maintenance.toString()).toBe("2");
    expect(netIncome(BigNumber.from("1"), maintenance).toString()).toBe("0");
    expect(netIncome(BigNumber.from("5"), maintenance).toString()).toBe("3");
  });

  it("applies real quantity, speed and efficiency effects", () => {
    expect(applyUpgradeEffect({ type: "quantity_multiplier", value: 0.25 }, 2, 4)).toBe(6);
    expect(applyUpgradeEffect({ type: "growth_speed", value: 0.2 }, 3, 5)).toBeCloseTo(2);
    expect(applyUpgradeEffect({ type: "transport_efficiency", value: 0.15 }, 2, 10)).toBe(7);
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
    expect(catalog.crops).toHaveLength(8);
    expect(catalog.eras[0]?.index).toBe(1);
  });
});

describe("Manual farm", () => {
  it("hires a planting worker and performs an unattended task", () => {
    const farmEngine = new FarmEngine();
    let state = createFarmState();
    state = farmEngine.dispatch(state, { type: "enter_era", eraIndex: 2 }).state;
    state = farmEngine.dispatch(state, { type: "hire_worker", role: "planting", efficiency: 1 }).state;
    state = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 2, growthSeconds: 5 }).state;
    expect(state.workers).toHaveLength(1);
    expect(state.parcels[0]?.stage).toBe("seed");
  });

  it("uses sprinklers to water and unlocking Era 2 enables potato cultivation", () => {
    const farmEngine = new FarmEngine();
    let state = createFarmState();
    state = farmEngine.dispatch(state, { type: "enter_era", eraIndex: 2 }).state;
    state = farmEngine.dispatch(state, { type: "set_crop", cropId: "potato" }).state;
    state = farmEngine.dispatch(state, { type: "upgrade_sprinkler", level: 1 }).state;
    state = farmEngine.dispatch(state, { type: "plant", parcelId: 0, seedCost: 1 }).state;
    state = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 2, growthSeconds: 5 }).state;
    expect(state.selectedCrop).toBe("potato");
    expect(state.sprinklerLevel).toBe(1);
    expect(state.parcels[0]?.stage).toBe("sprout");
  });
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
    const harvested = farmEngine.dispatch(state, { type: "harvest", parcelId: 0, quantity: 4, warehouseCapacity: 40 });
    expect(harvested.state.stock).toBe(4);
    const sent = farmEngine.dispatch(harvested.state, { type: "send_truck", truckCapacity: 20, tripSeconds: 12 });
    expect(sent.state.truckStatus).toBe("in_transit");
    expect(sent.state.truckCargo).toBe(4);
    expect(sent.state.stock).toBe(0);
  });

  it("does not harvest empty crops or unlock an already active parcel", () => {
    const farmEngine = new FarmEngine();
    const state = createFarmState();
    expect(farmEngine.dispatch(state, { type: "harvest", parcelId: 0, quantity: 4, warehouseCapacity: 40 }).events).toHaveLength(0);
    expect(farmEngine.dispatch(state, { type: "unlock_parcel", parcelId: 0, cost: 25 }).events).toHaveLength(0);
  });

  it("unlocks blocked parcels", () => {
    const farmEngine = new FarmEngine();
    const state = createFarmState();
    const result = farmEngine.dispatch(state, { type: "unlock_parcel", parcelId: 4, cost: 45 });
    expect(result.state.parcels[4]?.stage).toBe("empty");
  });

  it("stores harvest only up to warehouse capacity", () => {
    const farmEngine = new FarmEngine();
    let state = createFarmState();
    state = { ...state, stock: 38 };
    state = farmEngine.dispatch(state, { type: "plant", parcelId: 0, seedCost: 0.5 }).state;
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    state = farmEngine.dispatch(state, { type: "water", parcelId: 0 }).state;
    state = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 10, growthSeconds: 5 }).state;
    const harvested = farmEngine.dispatch(state, {
      type: "harvest",
      parcelId: 0,
      quantity: 4,
      warehouseCapacity: 40,
    });
    expect(harvested.state.stock).toBe(40);
  });

  it("blocks sending a second truck and sells after the truck returns", () => {
    const farmEngine = new FarmEngine();
    let state = { ...createFarmState(), stock: 25 };
    const sent = farmEngine.dispatch(state, { type: "send_truck", truckCapacity: 20, tripSeconds: 12 });
    state = sent.state;
    expect(state.truckCargo).toBe(20);
    expect(state.stock).toBe(5);
    expect(farmEngine.dispatch(state, { type: "send_truck", truckCapacity: 20, tripSeconds: 12 }).events).toHaveLength(0);

    const advanced = farmEngine.dispatch(state, { type: "advance", deltaSeconds: 12, growthSeconds: 5 });
    expect(advanced.state.truckStatus).toBe("available");
    expect(advanced.state.truckCargo).toBe(0);
    expect(advanced.events).toContainEqual({ type: "truck_returned", amount: 20 });
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
