export type ParcelStage = "blocked" | "empty" | "seed" | "sprout" | "growing" | "mature";

export interface Parcel {
  readonly id: number;
  readonly x: number;
  readonly z: number;
  readonly stage: ParcelStage;
  readonly progress: number;
  readonly watered: boolean;
}

export interface FarmState {
  readonly parcels: readonly Parcel[];
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
    stock: 0,
    storageCapacity: 40,
    truckCapacity: 20,
    truckCargo: 0,
    truckStatus: "available",
    truckRemainingSeconds: 0,
    truckTripSeconds: 12,
  };
}
