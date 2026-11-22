import type { FarmCommand, FarmEvent, FarmState, Parcel, ParcelStage, Worker } from "./FarmState";

export interface FarmResult {
  readonly state: FarmState;
  readonly events: readonly FarmEvent[];
  readonly income: number;
}

export class FarmEngine {
  dispatch(state: FarmState, command: FarmCommand): FarmResult {
    switch (command.type) {
      case "plant":
        return this.updateParcel(state, command.parcelId, (parcel) =>
          parcel.stage === "empty" ? { ...parcel, stage: "seed", progress: 0, watered: false } : parcel,
          "planted", -command.seedCost);
      case "water":
        return this.updateParcel(state, command.parcelId, (parcel) => {
          if (parcel.stage !== "seed" && parcel.stage !== "sprout") return parcel;
          return {
            ...parcel,
            stage: parcel.stage === "seed" ? "sprout" : "growing",
            watered: true,
          };
        }, "watered");
      case "harvest":
        return this.updateParcel(state, command.parcelId, (parcel) =>
          parcel.stage === "mature"
            ? { ...parcel, stage: "empty", progress: 0, watered: false }
            : parcel,
          "harvested", command.quantity, command.warehouseCapacity);
      case "set_crop":
        return { state: { ...state, selectedCrop: command.cropId }, income: 0, events: [] };
      case "hire_worker": {
        const roleCount = state.workers.filter((worker) => worker.role === command.role).length;
        const worker: Worker = {
          id: `${command.role}-${roleCount + 1}`,
          role: command.role,
          efficiency: command.efficiency,
          position: { x: roleCount % 2 === 0 ? -2.5 : 2.5, z: roleCount % 3 },
          targetParcelId: null,
        };
        return { state: { ...state, workers: [...state.workers, worker] }, income: 0, events: [] };
      }
      case "upgrade_sprinkler":
        return { state: { ...state, sprinklerLevel: command.level }, income: 0, events: [] };
      case "upgrade_building":
        return {
          state: command.building === "shed"
            ? { ...state, shedLevel: command.level }
            : { ...state, boxesLevel: command.level },
          income: 0,
          events: [],
        };
      case "enter_era":
        return { state: { ...state, eraIndex: Math.max(state.eraIndex, command.eraIndex) }, income: 0, events: [] };
      case "send_truck":
        if (state.truckStatus !== "available" || state.stock <= 0) {
          return { state, income: 0, events: [] };
        }
        const truckCargo = Math.min(state.stock, command.truckCapacity);
        return {
          state: {
            ...state,
            stock: state.stock - truckCargo,
            truckCargo,
            truckCapacity: command.truckCapacity,
            truckStatus: "in_transit",
            truckRemainingSeconds: command.tripSeconds,
            truckTripSeconds: command.tripSeconds,
          },
          income: 0,
          events: [{ type: "truck_sent", amount: truckCargo }],
        };
      case "unlock_parcel":
        return this.updateParcel(state, command.parcelId, (parcel) =>
          parcel.stage === "blocked" ? { ...parcel, stage: "empty" } : parcel,
          "unlocked", -command.cost);
      case "advance": {
        const events: FarmEvent[] = [];
        let parcels = state.parcels.map((parcel): Parcel => {
          if (!parcel.watered || !["sprout", "growing"].includes(parcel.stage)) return parcel;
          const nextProgress = Math.min(1, parcel.progress + command.deltaSeconds / command.growthSeconds);
          let stage: ParcelStage = nextProgress >= 1 ? "mature" : parcel.stage;
          if (nextProgress >= 1) events.push({ type: "harvested", parcelId: parcel.id });
          return { ...parcel, progress: nextProgress, stage };
        });

        const accumulator = state.automationAccumulator + command.deltaSeconds;
        const automationStep = accumulator >= 2;
        let stock = state.stock;

        if (automationStep) {
          const planting = state.workers.find((worker) => worker.role === "planting");
          if (planting) {
            const empty = parcels.find((parcel) => parcel.stage === "empty");
            if (empty) {
              parcels = parcels.map((parcel) => parcel.id === empty.id
                ? { ...parcel, stage: "seed", progress: 0, watered: false }
                : parcel);
              events.push({ type: "planted", parcelId: empty.id });
            }
          }

          const watering = state.workers.find((worker) => worker.role === "watering");
          if (watering || state.sprinklerLevel > 0) {
            parcels = parcels.map((parcel) => {
              if (parcel.stage !== "seed" && parcel.stage !== "sprout") return parcel;
              return {
                ...parcel,
                stage: parcel.stage === "seed" ? "sprout" : "growing",
                watered: true,
              };
            });
          }

          const harvesting = state.workers.find((worker) => worker.role === "harvesting");
          if (harvesting) {
            const mature = parcels.find((parcel) => parcel.stage === "mature");
            if (mature) {
              const quantity = Math.max(1, Math.round(4 * harvesting.efficiency));
              const capacity = state.storageCapacity;
              stock = Math.min(capacity, stock + quantity);
              parcels = parcels.map((parcel) => parcel.id === mature.id
                ? { ...parcel, stage: "empty", progress: 0, watered: false }
                : parcel);
              events.push({ type: "harvested", parcelId: mature.id, amount: quantity });
            }
          }
        }

        let truckState = {
          ...state,
          parcels,
          stock,
          automationAccumulator: automationStep ? accumulator % 2 : accumulator,
        };
        if (truckState.truckStatus === "in_transit") {
          const truckRemainingSeconds = Math.max(0, truckState.truckRemainingSeconds - command.deltaSeconds);
          if (truckRemainingSeconds === 0) {
            events.push({ type: "truck_returned", amount: truckState.truckCargo });
            truckState = {
              ...truckState,
              truckCargo: 0,
              truckStatus: "available",
              truckRemainingSeconds: 0,
            };
          } else {
            truckState = { ...truckState, truckRemainingSeconds };
          }
        }
        return { state: truckState, income: 0, events };
      }
    }
  }

  private updateParcel(
    state: FarmState,
    parcelId: number,
    transform: (parcel: Parcel) => Parcel,
    eventType: FarmEvent["type"],
    amount = 0,
    warehouseCapacity?: number,
  ): FarmResult {
    const before = state.parcels.find((parcel) => parcel.id === parcelId);
    if (!before) return { state, income: 0, events: [] };
    const after = transform(before);
    if (after === before) return { state, income: 0, events: [] };
    const parcels = state.parcels.map((parcel) => parcel.id === parcelId ? after : parcel);
    let stock = state.stock;
    if (eventType === "harvested" && amount > 0) {
      const capacity = warehouseCapacity ?? state.storageCapacity;
      stock = Math.min(capacity, state.stock + amount);
    }
    return {
      state: { ...state, parcels, stock },
      income: amount > 0 && eventType === "harvested" ? 0 : amount,
      events: [{ type: eventType, parcelId, ...(amount > 0 ? { amount } : {}) }],
    };
  }
}
