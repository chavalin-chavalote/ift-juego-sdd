import type { FarmCommand, FarmEvent, FarmState, Parcel, ParcelStage } from "./FarmState";

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
        const parcels = state.parcels.map((parcel): Parcel => {
          if (!parcel.watered || !["sprout", "growing"].includes(parcel.stage)) return parcel;
          const nextProgress = Math.min(1, parcel.progress + command.deltaSeconds / command.growthSeconds);
          let stage: ParcelStage = nextProgress >= 1 ? "mature" : parcel.stage;
          if (nextProgress >= 1) events.push({ type: "harvested", parcelId: parcel.id });
          return { ...parcel, progress: nextProgress, stage };
        });
        let truckState = { ...state, parcels };
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
