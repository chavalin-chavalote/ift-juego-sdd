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
          "harvested", command.quantity);
      case "sell_stock":
        return {
          state: { ...state, stock: 0 },
          income: state.stock * command.price,
          events: state.stock > 0 ? [{ type: "sold", amount: state.stock * command.price }] : [],
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
        return { state: { ...state, parcels }, income: 0, events };
      }
    }
  }

  private updateParcel(
    state: FarmState,
    parcelId: number,
    transform: (parcel: Parcel) => Parcel,
    eventType: FarmEvent["type"],
    amount = 0,
  ): FarmResult {
    const before = state.parcels.find((parcel) => parcel.id === parcelId);
    if (!before) return { state, income: 0, events: [] };
    const after = transform(before);
    if (after === before) return { state, income: 0, events: [] };
    const parcels = state.parcels.map((parcel) => parcel.id === parcelId ? after : parcel);
    let stock = state.stock;
    if (eventType === "harvested" && amount > 0) stock += amount;
    return {
      state: { ...state, parcels, stock },
      income: amount > 0 && eventType === "harvested" ? 0 : amount,
      events: [{ type: eventType, parcelId, ...(amount > 0 ? { amount } : {}) }],
    };
  }
}
