import type { DecimalString } from "../numbers/BigNumber";
import type { GameState } from "./GameState";

export type GameCommand =
  | { readonly type: "buy_upgrade"; readonly upgradeId: string; readonly quantity: 1 | 10 | 25 | "max" }
  | { readonly type: "add_income"; readonly amount: DecimalString }
  | { readonly type: "tick"; readonly deltaSeconds: number };

export interface GameEvent {
  readonly type: "upgrade_purchased" | "income_added" | "tick";
  readonly stateSequence: number;
  readonly data: Readonly<Record<string, string | number>>;
}

export interface CommandResult {
  readonly state: GameState;
  readonly events: readonly GameEvent[];
}
