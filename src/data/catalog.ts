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
  }, {
    id: "lettuce", nameKey: "crop.lettuce", eraId: "era_1",
    seedCost: "0.3", growthSeconds: 3, productionCost: "0.03",
    quantityPerCycle: 6, sellPrice: "0.35", unlock: "era_1",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "carrot", nameKey: "crop.carrot", eraId: "era_1",
    seedCost: "0.4", growthSeconds: 4, productionCost: "0.04",
    quantityPerCycle: 5, sellPrice: "0.42", unlock: "era_1",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "potato", nameKey: "crop.potato", eraId: "era_2",
    seedCost: "1", growthSeconds: 7, productionCost: "0.12",
    quantityPerCycle: 8, sellPrice: "0.55", unlock: "era_2",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "corn", nameKey: "crop.corn", eraId: "era_2",
    seedCost: "1.5", growthSeconds: 9, productionCost: "0.18",
    quantityPerCycle: 6, sellPrice: "0.9", unlock: "era_2",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "wheat", nameKey: "crop.wheat", eraId: "era_3",
    seedCost: "3", growthSeconds: 12, productionCost: "0.25",
    quantityPerCycle: 10, sellPrice: "0.75", unlock: "era_3",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "strawberry", nameKey: "crop.strawberry", eraId: "era_4",
    seedCost: "8", growthSeconds: 15, productionCost: "0.6",
    quantityPerCycle: 12, sellPrice: "1.8", unlock: "era_4",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
  }, {
    id: "pumpkin", nameKey: "crop.pumpkin", eraId: "era_4",
    seedCost: "12", growthSeconds: 20, productionCost: "0.8",
    quantityPerCycle: 8, sellPrice: "3", unlock: "era_4",
    visualStages: ["seed", "sprout", "growing", "mature"], qualityRange: [0.8, 1.2],
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
  }, {
    id: "worker_planting",
    nameKey: "upgrade.worker_planting",
    category: "workers",
    eraId: "era_2",
    baseCost: "40",
    growth: 1.6,
    maxLevel: 20,
    effect: { type: "automation_efficiency", value: 0.25 },
    unlock: "era_2",
    visualImpact: true,
  }, {
    id: "worker_watering",
    nameKey: "upgrade.worker_watering",
    category: "workers",
    eraId: "era_2",
    baseCost: "55",
    growth: 1.6,
    maxLevel: 20,
    effect: { type: "automation_efficiency", value: 0.25 },
    unlock: "era_2",
    visualImpact: true,
  }, {
    id: "worker_harvesting",
    nameKey: "upgrade.worker_harvesting",
    category: "workers",
    eraId: "era_2",
    baseCost: "70",
    growth: 1.6,
    maxLevel: 20,
    effect: { type: "automation_efficiency", value: 0.25 },
    unlock: "era_2",
    visualImpact: true,
  }, {
    id: "sprinkler",
    nameKey: "upgrade.sprinkler",
    category: "automation",
    eraId: "era_2",
    baseCost: "90",
    growth: 1.5,
    maxLevel: 20,
    effect: { type: "irrigation_coverage", value: 1 },
    unlock: "era_2",
    visualImpact: true,
  }, {
    id: "shed",
    nameKey: "upgrade.shed",
    category: "storage",
    eraId: "era_2",
    baseCost: "150",
    growth: 1.55,
    maxLevel: 20,
    effect: { type: "storage_additive", value: 20 },
    unlock: "era_2",
    visualImpact: true,
  }, {
    id: "boxes",
    nameKey: "upgrade.boxes",
    category: "storage",
    eraId: "era_2",
    baseCost: "120",
    growth: 1.55,
    maxLevel: 20,
    effect: { type: "storage_additive", value: 10 },
    unlock: "era_2",
    visualImpact: true,
  }],
  eras: [{
    id: "era_1",
    index: 1,
    nameKey: "era.manual",
    entryCost: "0",
    scaleMultiplier: 1,
  }, {
    id: "era_2", index: 2, nameKey: "era.small_farm",
    entryCost: "500", scaleMultiplier: 75,
  }, {
    id: "era_3", index: 3, nameKey: "era.industrial",
    entryCost: "50000", scaleMultiplier: 75,
  }, {
    id: "era_4", index: 4, nameKey: "era.smart",
    entryCost: "5000000", scaleMultiplier: 100,
  }, {
    id: "era_5", index: 5, nameKey: "era.futuristic",
    entryCost: "1000000000", scaleMultiplier: 100,
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
