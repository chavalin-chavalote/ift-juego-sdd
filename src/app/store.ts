import { create } from "zustand";
import { BigNumber } from "../core/numbers/BigNumber";
import { createInitialGameState, type GameState } from "../core/state/GameState";
import { GameEngine } from "../core/state/GameEngine";
import { FarmEngine } from "../core/farm/FarmEngine";
import { createFarmState, type FarmState } from "../core/farm/FarmState";
import type { CropId, WorkerRole } from "../core/farm/FarmState";

export interface UpgradeView {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly baseCost: string;
  readonly growth: number;
  readonly maxLevel: number;
  readonly category: "speed" | "quantity" | "quality" | "price" | "storage" | "transport";
  readonly unlock: string;
}

export const upgrades: readonly UpgradeView[] = [
  { id: "tomato_quantity", name: "Más tomates", description: "+25% cantidad por cosecha", baseCost: "5", growth: 1.15, maxLevel: 100, category: "quantity", unlock: "era_1" },
  { id: "tomato_speed", name: "Crecimiento rápido", description: "-20% tiempo por nivel", baseCost: "8", growth: 1.18, maxLevel: 100, category: "speed", unlock: "era_1" },
  { id: "tomato_price", name: "Mejor venta", description: "+15% precio", baseCost: "12", growth: 1.20, maxLevel: 100, category: "price", unlock: "era_1" },
  { id: "tomato_quality", name: "Calidad selecta", description: "+10% calidad", baseCost: "20", growth: 1.22, maxLevel: 100, category: "quality", unlock: "era_1" },
  { id: "warehouse", name: "Capacidad del almacén", description: "+25% capacidad de almacenaje", baseCost: "30", growth: 1.25, maxLevel: 50, category: "storage", unlock: "era_1" },
  { id: "truck_capacity", name: "Capacidad del camión", description: "+10 tomates por nivel", baseCost: "35", growth: 1.25, maxLevel: 50, category: "transport", unlock: "era_1" },
  { id: "truck_speed", name: "Velocidad del camión", description: "-15% duración del viaje", baseCost: "40", growth: 1.22, maxLevel: 50, category: "transport", unlock: "era_1" },
  { id: "manual_tools", name: "Herramientas", description: "+10% rendimiento manual", baseCost: "10", growth: 1.18, maxLevel: 100, category: "quantity", unlock: "era_1" },
];

const upgradeCatalog = Object.fromEntries(upgrades.map((upgrade) => [
  upgrade.id,
  { baseCost: upgrade.baseCost, growth: upgrade.growth, maxLevel: upgrade.maxLevel },
]));

export interface FloatingText {
  readonly id: number;
  readonly text: string;
  readonly kind: "gain" | "action";
}

interface Store {
  readonly game: GameState;
  readonly farm: FarmState;
  readonly selectedParcelId: number | null;
  readonly floatingTexts: readonly FloatingText[];
  readonly harvestPulse: number;
  readonly incomePerSecond: number;
  readonly selectParcel: (id: number) => void;
  readonly tick: (deltaSeconds: number) => void;
  readonly plant: (parcelId: number) => void;
  readonly water: (parcelId: number) => void;
  readonly harvest: (parcelId: number) => void;
  readonly sendTruck: () => void;
  readonly unlockParcel: (parcelId: number) => void;
  readonly setCrop: (cropId: CropId) => void;
  readonly hireWorker: (role: WorkerRole) => void;
  readonly upgradeSprinkler: () => void;
  readonly upgradeBuilding: (building: "shed" | "boxes") => void;
  readonly enterEraTwo: () => void;
  readonly buyUpgrade: (upgradeId: string, quantity: 1 | 10 | 25 | "max") => void;
  readonly clearFloatingText: (id: number) => void;
}

const engine = new GameEngine(upgradeCatalog);
const farmEngine = new FarmEngine();
let nextFloatingId = 1;

export const useGameStore = create<Store>((set, get) => ({
  game: createInitialGameState(),
  farm: createFarmState(),
  selectedParcelId: null,
  floatingTexts: [],
  harvestPulse: 0,
  incomePerSecond: 0,

  selectParcel: (selectedParcelId) => set({ selectedParcelId }),

  tick: (deltaSeconds) => {
    const state = get();
    const speedLevel = state.game.upgradeLevels.tomato_speed ?? 0;
    const speedMultiplier = Math.max(0.25, 1 - speedLevel * 0.2);
    const result = farmEngine.dispatch(state.farm, {
      type: "advance",
      deltaSeconds,
      growthSeconds: 5 * speedMultiplier,
    });
    const warehouseLevel = state.game.upgradeLevels.warehouse ?? 0;
    const truckLevel = state.game.upgradeLevels.truck_capacity ?? 0;
    const warehouseCapacityBonus = result.state.shedLevel * 20 + result.state.boxesLevel * 10;
    const syncedFarm = {
      ...result.state,
      eraIndex: state.game.eraIndex,
      storageCapacity: Math.floor(40 * (1 + warehouseLevel * 0.25)) + warehouseCapacityBonus,
      truckCapacity: 20 + truckLevel * 10,
    };
    let game = engine.dispatch(state.game, { type: "tick", deltaSeconds }).state;
    const truckReturn = result.events.find((event) => event.type === "truck_returned");
    if (truckReturn?.amount) {
      const priceLevel = state.game.upgradeLevels.tomato_price ?? 0;
      const qualityLevel = state.game.upgradeLevels.tomato_quality ?? 0;
      const toolsLevel = state.game.upgradeLevels.manual_tools ?? 0;
      const unitPrice = 0.5 * (1 + priceLevel * 0.15) * (1 + qualityLevel * 0.1) * (1 + toolsLevel * 0.1);
      const revenue = truckReturn.amount * unitPrice;
      game = engine.dispatch(game, { type: "add_income", amount: revenue.toFixed(4) }).state;
    }
    set({
      game,
      farm: syncedFarm,
      incomePerSecond: result.state.parcels.filter((parcel) => parcel.stage === "mature").length * 0.02,
      floatingTexts: truckReturn?.amount
        ? [...state.floatingTexts, { id: nextFloatingId++, text: `Camión vendido · ${truckReturn.amount}`, kind: "gain" }]
        : state.floatingTexts,
    });
  },

  plant: (parcelId) => {
    const state = get();
    const parcel = state.farm.parcels.find((item) => item.id === parcelId);
    if (!parcel || parcel.stage !== "empty") return;
    const cropCosts: Record<CropId, number> = { tomato: 0.5, lettuce: 0.3, carrot: 0.4, potato: 1 };
    const seedCost = cropCosts[state.farm.selectedCrop];
    const money = BigNumber.from(state.game.money);
    if (money.cmp(BigNumber.from(seedCost)) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: seedCost.toFixed(2) }).state;
    const farm = farmEngine.dispatch(state.farm, { type: "plant", parcelId, seedCost }).state;
    set({ game, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Sembrado", kind: "action" }] });
  },

  water: (parcelId) => {
    const state = get();
    const farm = farmEngine.dispatch(state.farm, { type: "water", parcelId }).state;
    if (farm === state.farm) return;
    set({ farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Riego", kind: "action" }] });
  },

  harvest: (parcelId) => {
    const state = get();
    const quantityLevel = state.game.upgradeLevels.tomato_quantity ?? 0;
    const cropQuantities: Record<CropId, number> = { tomato: 4, lettuce: 6, carrot: 5, potato: 8 };
    const quantity = Math.max(1, Math.floor(cropQuantities[state.farm.selectedCrop] * (1 + quantityLevel * 0.25)));
    const warehouseLevel = state.game.upgradeLevels.warehouse ?? 0;
    const warehouseCapacity = Math.floor(40 * (1 + warehouseLevel * 0.25))
      + state.farm.shedLevel * 20 + state.farm.boxesLevel * 10;
    const result = farmEngine.dispatch(state.farm, { type: "harvest", parcelId, quantity, warehouseCapacity });
    if (result.events.length === 0) return;
    set({
      farm: result.state,
      harvestPulse: state.harvestPulse + 1,
      floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: `+${quantity} tomates`, kind: "gain" }],
    });
  },

  sendTruck: () => {
    const state = get();
    if (state.farm.stock <= 0 || state.farm.truckStatus !== "available") return;
    const truckLevel = state.game.upgradeLevels.truck_capacity ?? 0;
    const speedLevel = state.game.upgradeLevels.truck_speed ?? 0;
    const truckCapacity = 20 + truckLevel * 10;
    const tripSeconds = Math.max(3, 12 * Math.max(0.25, 1 - speedLevel * 0.15));
    const result = farmEngine.dispatch(state.farm, {
      type: "send_truck",
      truckCapacity,
      tripSeconds,
    });
    if (result.events.length === 0) return;
    set({
      farm: result.state,
      floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Camión en ruta", kind: "action" }],
    });
  },

  unlockParcel: (parcelId) => {
    const state = get();
    const parcel = state.farm.parcels.find((item) => item.id === parcelId);
    if (!parcel || parcel.stage !== "blocked") return;
    const cost = 25 + parcel.id * 5;
    if (BigNumber.from(state.game.money).cmp(BigNumber.from(cost)) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: cost.toFixed(2) }).state;
    const farm = farmEngine.dispatch(state.farm, { type: "unlock_parcel", parcelId, cost }).state;
    set({ game, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Parcela ampliada", kind: "action" }] });
  },

  setCrop: (cropId) => {
    const state = get();
    if (cropId === "potato" && state.game.eraIndex < 2) return;
    const farm = farmEngine.dispatch(state.farm, { type: "set_crop", cropId }).state;
    set({ farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Cultivo seleccionado", kind: "action" }] });
  },

  hireWorker: (role) => {
    const state = get();
    const count = state.farm.workers.filter((worker) => worker.role === role).length;
    const baseCost = role === "planting" ? 40 : role === "watering" ? 55 : 70;
    const cost = baseCost * Math.pow(1.6, count);
    if (state.game.eraIndex < 2 || BigNumber.from(state.game.money).cmp(BigNumber.from(cost)) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: cost.toFixed(2) }).state;
    const farm = farmEngine.dispatch(state.farm, {
      type: "hire_worker",
      role,
      efficiency: 1 + count * 0.25,
    }).state;
    set({ game, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Trabajador contratado", kind: "gain" }] });
  },

  upgradeSprinkler: () => {
    const state = get();
    const level = state.farm.sprinklerLevel;
    const cost = 90 * Math.pow(1.5, level);
    if (state.game.eraIndex < 2 || BigNumber.from(state.game.money).cmp(BigNumber.from(cost)) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: cost.toFixed(2) }).state;
    const farm = farmEngine.dispatch(state.farm, { type: "upgrade_sprinkler", level: level + 1 }).state;
    set({ game, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Aspersor mejorado", kind: "gain" }] });
  },

  upgradeBuilding: (building) => {
    const state = get();
    const level = building === "shed" ? state.farm.shedLevel : state.farm.boxesLevel;
    const baseCost = building === "shed" ? 150 : 120;
    const cost = baseCost * Math.pow(1.55, level);
    if (state.game.eraIndex < 2 || BigNumber.from(state.game.money).cmp(BigNumber.from(cost)) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: cost.toFixed(2) }).state;
    const farm = farmEngine.dispatch(state.farm, { type: "upgrade_building", building, level: level + 1 }).state;
    set({ game, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Edificio mejorado", kind: "gain" }] });
  },

  enterEraTwo: () => {
    const state = get();
    if (state.game.eraIndex >= 2) return;
    if (BigNumber.from(state.game.money).cmp(BigNumber.from("500")) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: "500" }).state;
    const eraGame = { ...game, eraIndex: 2 };
    const farm = farmEngine.dispatch(state.farm, { type: "enter_era", eraIndex: 2 }).state;
    set({ game: eraGame, farm, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Era 2 · Pequeña granja", kind: "gain" }] });
  },

  buyUpgrade: (upgradeId, quantity) => {
    const state = get();
    try {
      const game = engine.dispatch(state.game, { type: "buy_upgrade", upgradeId, quantity }).state;
      set({ game, floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Mejora comprada", kind: "gain" }] });
    } catch {
      set({ floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: "Dinero insuficiente", kind: "action" }] });
    }
  },

  clearFloatingText: (id) => set((state) => ({
    floatingTexts: state.floatingTexts.filter((item) => item.id !== id),
  })),
}));
