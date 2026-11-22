import { DataCatalogSchema, type DataCatalog } from "./schemas";

export const eraOneCatalog: unknown = {
  crops: [{
    id: "tomato",
    nameKey: "crop.tomato",
    eraId: "era_1",
    seedCost: "0.5",
    growthSeconds: 5,
    productionCost: "0.05",
    quantityPerCycle: 4,
    sellPrice: "0.5",
    unlock: "era_1",
    visualStages: ["seed", "sprout", "growing", "mature"],
    qualityRange: [0.8, 1.2],
  }],
  upgrades: [{
    id: "tomato_quantity",
    nameKey: "upgrade.tomato_quantity",
    category: "quantity",
    eraId: "era_1",
    baseCost: "5",
    growth: 1.15,
    maxLevel: 100,
    effect: { type: "quantity_multiplier", value: 0.25 },
    unlock: "era_1",
    visualImpact: true,
  }, {
    id: "tomato_speed",
    nameKey: "upgrade.tomato_speed",
    category: "speed",
    eraId: "era_1",
    baseCost: "8",
    growth: 1.18,
    maxLevel: 100,
    effect: { type: "growth_speed", value: 0.2 },
    unlock: "era_1",
    visualImpact: true,
  }],
  eras: [{
    id: "era_1",
    index: 1,
    nameKey: "era.manual",
    entryCost: "0",
    scaleMultiplier: 1,
  }],
};

export function loadEraOneCatalog(): DataCatalog {
  const catalog = DataCatalogSchema.parse(eraOneCatalog);
  const ids = catalog.eras.map((era) => era.id);
  for (const item of [...catalog.crops, ...catalog.upgrades]) {
    if (!ids.includes(item.unlock) && !catalog.upgrades.some((upgrade) => upgrade.id === item.unlock)) {
      throw new Error(`Invalid unlock reference: ${item.unlock}`);
    }
  }
  return catalog;
}
