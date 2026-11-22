export type ParcelStage = "blocked" | "empty" | "seed" | "sprout" | "growing" | "mature";

export interface Parcel {
  readonly id: number;
  readonly x: number;
  readonly z: number;
  readonly stage: ParcelStage;
  readonly progress: number;
  readonly watered: boolean;
}

export type CropId = "tomato" | "lettuce" | "carrot" | "potato";
export type WorkerRole = "planting" | "watering" | "harvesting";

export interface AgentPosition {
  readonly x: number;
  readonly z: number;
}

export interface Worker {
  readonly id: string;
  readonly role: WorkerRole;
  readonly efficiency: number;
  readonly position: AgentPosition;
  readonly targetParcelId: number | null;
}

export interface FarmState {
  readonly parcels: readonly Parcel[];
  readonly selectedCrop: CropId;
  readonly eraIndex: number;
  readonly workers: readonly Worker[];
  readonly sprinklerLevel: number;
  readonly shedLevel: number;
  readonly boxesLevel: number;
  readonly automationAccumulator: number;
  readonly stock: number;
  readonly storageCapacity: number;
  readonly truckCapacity: number;
  readonly truckCargo: number;
  readonly truckStatus: "available" | "in_transit";
  readonly truckRemainingSeconds: number;
  readonly truckTripSeconds: number;
}

export type FarmCommand =
  | { readonly type: "plant"; readonly parcelId: number; readonly seedCost: number }
  | { readonly type: "water"; readonly parcelId: number }
  | { readonly type: "harvest"; readonly parcelId: number; readonly quantity: number; readonly warehouseCapacity: number }
  | { readonly type: "set_crop"; readonly cropId: CropId }
  | { readonly type: "hire_worker"; readonly role: WorkerRole; readonly efficiency: number }
  | { readonly type: "upgrade_sprinkler"; readonly level: number }
  | { readonly type: "upgrade_building"; readonly building: "shed" | "boxes"; readonly level: number }
  | { readonly type: "enter_era"; readonly eraIndex: number }
  | { readonly type: "send_truck"; readonly truckCapacity: number; readonly tripSeconds: number }
  | { readonly type: "unlock_parcel"; readonly parcelId: number; readonly cost: number }
  | { readonly type: "advance"; readonly deltaSeconds: number; readonly growthSeconds: number };

export interface FarmEvent {
  readonly type: "planted" | "watered" | "harvested" | "truck_sent" | "truck_returned" | "unlocked";
  readonly parcelId?: number;
  readonly amount?: number;
}

export function createFarmState(): FarmState {
  const parcels: Parcel[] = [];
  for (let z = 0; z < 4; z++) {
    for (let x = 0; x < 4; x++) {
      const id = z * 4 + x;
      parcels.push({
        id,
        x: x - 1.5,
        z: z - 1.5,
        stage: id < 4 ? "empty" : "blocked",
        progress: 0,
        watered: false,
      });
    }
  }
  return {
    parcels,
    selectedCrop: "tomato",
    eraIndex: 1,
    workers: [],
    sprinklerLevel: 0,
    shedLevel: 0,
    boxesLevel: 0,
    automationAccumulator: 0,
    stock: 0,
    storageCapacity: 40,
    truckCapacity: 20,
    truckCargo: 0,
    truckStatus: "available",
    truckRemainingSeconds: 0,
    truckTripSeconds: 12,
  };
}
