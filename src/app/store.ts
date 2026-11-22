import { create } from "zustand";
import { BigNumber } from "../core/numbers/BigNumber";
import { createInitialGameState, type GameState } from "../core/state/GameState";
import { GameEngine } from "../core/state/GameEngine";
import { FarmEngine } from "../core/farm/FarmEngine";
import { createFarmState, type FarmState } from "../core/farm/FarmState";

export interface UpgradeView {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly baseCost: string;
  readonly growth: number;
  readonly maxLevel: number;
}

export const upgrades: readonly UpgradeView[] = [
  { id: "tomato_quantity", name: "Más tomates", description: "+25% cantidad por cosecha", baseCost: "5", growth: 1.15, maxLevel: 100 },
  { id: "tomato_speed", name: "Crecimiento rápido", description: "-20% tiempo por nivel", baseCost: "8", growth: 1.18, maxLevel: 100 },
  { id: "tomato_price", name: "Mejor venta", description: "+15% precio", baseCost: "12", growth: 1.20, maxLevel: 100 },
  { id: "tomato_quality", name: "Calidad selecta", description: "+10% calidad", baseCost: "20", growth: 1.22, maxLevel: 100 },
  { id: "warehouse", name: "Almacén", description: "+25% stock transportado", baseCost: "30", growth: 1.25, maxLevel: 50 },
  { id: "wheelbarrow", name: "Carretilla", description: "-15% coste de transporte", baseCost: "18", growth: 1.22, maxLevel: 50 },
  { id: "manual_tools", name: "Herramientas", description: "+10% rendimiento manual", baseCost: "10", growth: 1.18, maxLevel: 100 },
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
  readonly sellStock: () => void;
  readonly unlockParcel: (parcelId: number) => void;
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
    set({
      game: engine.dispatch(state.game, { type: "tick", deltaSeconds }).state,
      farm: result.state,
      incomePerSecond: result.state.parcels.filter((parcel) => parcel.stage === "mature").length * 0.02,
    });
  },

  plant: (parcelId) => {
    const state = get();
    const parcel = state.farm.parcels.find((item) => item.id === parcelId);
    if (!parcel || parcel.stage !== "empty") return;
    const money = BigNumber.from(state.game.money);
    if (money.cmp(BigNumber.from("0.5")) < 0) return;
    const game = engine.dispatch(state.game, { type: "spend", amount: "0.5" }).state;
    const farm = farmEngine.dispatch(state.farm, { type: "plant", parcelId, seedCost: 0.5 }).state;
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
    const warehouseLevel = state.game.upgradeLevels.warehouse ?? 0;
    const quantity = Math.max(4, Math.floor(4 * (1 + quantityLevel * 0.25) * (1 + warehouseLevel * 0.25)));
    const result = farmEngine.dispatch(state.farm, { type: "harvest", parcelId, quantity });
    if (result.events.length === 0) return;
    set({
      farm: result.state,
      harvestPulse: state.harvestPulse + 1,
      floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: `+${quantity} tomates`, kind: "gain" }],
    });
  },

  sellStock: () => {
    const state = get();
    if (state.farm.stock <= 0) return;
    const priceLevel = state.game.upgradeLevels.tomato_price ?? 0;
    const qualityLevel = state.game.upgradeLevels.tomato_quality ?? 0;
    const toolsLevel = state.game.upgradeLevels.manual_tools ?? 0;
    const unitPrice = 0.5 * (1 + priceLevel * 0.15) * (1 + qualityLevel * 0.1) * (1 + toolsLevel * 0.1);
    const revenue = state.farm.stock * unitPrice;
    const result = farmEngine.dispatch(state.farm, { type: "sell_stock", price: unitPrice });
    const game = engine.dispatch(state.game, { type: "add_income", amount: revenue.toFixed(4) }).state;
    set({
      game,
      farm: result.state,
      floatingTexts: [...state.floatingTexts, { id: nextFloatingId++, text: `+${revenue.toFixed(2)} $`, kind: "gain" }],
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
