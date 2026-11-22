import { z } from "zod";

const positiveDecimal = z.string().regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "Expected finite decimal string");

export const CropSchema = z.object({
  id: z.string().min(1),
  nameKey: z.string().min(1),
  eraId: z.string().min(1),
  seedCost: positiveDecimal,
  growthSeconds: z.number().positive(),
  productionCost: positiveDecimal,
  quantityPerCycle: z.number().int().positive(),
  sellPrice: positiveDecimal,
  unlock: z.string().min(1),
  visualStages: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  qualityRange: z.tuple([z.number().positive(), z.number().positive()]),
});

export const UpgradeSchema = z.object({
  id: z.string().min(1),
  nameKey: z.string().min(1),
  category: z.enum(["speed", "quantity", "quality", "price", "storage", "transport", "workers", "machinery", "automation", "research"]),
  eraId: z.string().min(1),
  baseCost: positiveDecimal,
  growth: z.number().min(1.01).max(2),
  maxLevel: z.number().int().positive(),
  effect: z.object({ type: z.string(), value: z.number() }),
  unlock: z.string().min(1),
  visualImpact: z.boolean(),
});

export const EraSchema = z.object({
  id: z.string().min(1),
  index: z.number().int().min(1).max(5),
  nameKey: z.string().min(1),
  entryCost: positiveDecimal,
  scaleMultiplier: z.number().positive(),
});

export const DataCatalogSchema = z.object({
  crops: z.array(CropSchema),
  upgrades: z.array(UpgradeSchema),
  eras: z.array(EraSchema),
});

export type DataCatalog = z.infer<typeof DataCatalogSchema>;
