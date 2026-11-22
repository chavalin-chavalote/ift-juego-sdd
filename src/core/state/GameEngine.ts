import { affordableMaximum, bulkCost, type UpgradeCostConfig } from "../economy/Economy";
import { BigNumber } from "../numbers/BigNumber";
import type { CommandResult, GameCommand } from "./commands";
import type { GameState, UpgradeLevels } from "./GameState";

export type UpgradeCatalog = Readonly<Record<string, UpgradeCostConfig>>;

export class GameEngine {
  constructor(private readonly upgrades: UpgradeCatalog) {}

  dispatch(state: GameState, command: GameCommand): CommandResult {
    switch (command.type) {
      case "add_income":
        return this.addIncome(state, BigNumber.from(command.amount));
      case "spend":
        return this.spend(state, BigNumber.from(command.amount));
      case "buy_upgrade":
        return this.buyUpgrade(state, command.upgradeId, command.quantity);
      case "tick":
        return {
          state: {
            ...state,
            elapsedSeconds: state.elapsedSeconds + Math.max(0, command.deltaSeconds),
            sequence: state.sequence + 1,
          },
          events: [{ type: "tick", stateSequence: state.sequence + 1, data: { deltaSeconds: Math.max(0, command.deltaSeconds) } }],
        };
    }
  }

  private addIncome(state: GameState, amount: BigNumber): CommandResult {
    if (amount.cmp(BigNumber.zero()) < 0) throw new Error("Income cannot be negative");
    const nextMoney = BigNumber.from(state.money).add(amount);
    const nextSequence = state.sequence + 1;
    return {
      state: {
        ...state,
        money: nextMoney.toString(),
        totalProduced: BigNumber.from(state.totalProduced).add(amount).toString(),
        sequence: nextSequence,
      },
      events: [{ type: "income_added", stateSequence: nextSequence, data: { amount: amount.toString() } }],
    };
  }

  private spend(state: GameState, amount: BigNumber): CommandResult {
    if (amount.cmp(BigNumber.zero()) <= 0) throw new Error("Spend amount must be positive");
    if (BigNumber.from(state.money).cmp(amount) < 0) throw new Error("Insufficient funds");
    const nextSequence = state.sequence + 1;
    return {
      state: {
        ...state,
        money: BigNumber.from(state.money).sub(amount).toString(),
        sequence: nextSequence,
      },
      events: [{ type: "income_added", stateSequence: nextSequence, data: { amount: `-${amount.toString()}` } }],
    };
  }

  private buyUpgrade(state: GameState, upgradeId: string, quantity: 1 | 10 | 25 | "max"): CommandResult {
    const config = this.upgrades[upgradeId];
    if (!config) throw new Error(`Unknown upgrade: ${upgradeId}`);

    const currentLevel = state.upgradeLevels[upgradeId] ?? 0;
    const count = quantity === "max"
      ? affordableMaximum(config, currentLevel, BigNumber.from(state.money))
      : quantity;
    const purchase = bulkCost(config, currentLevel, count);

    if (purchase.count === 0) throw new Error("Upgrade purchase is unavailable");
    if (BigNumber.from(state.money).cmp(purchase.cost) < 0) throw new Error("Insufficient funds");

    const upgradeLevels: UpgradeLevels = {
      ...state.upgradeLevels,
      [upgradeId]: currentLevel + purchase.count,
    };
    const nextMoney = BigNumber.from(state.money).sub(purchase.cost);
    const nextSequence = state.sequence + 1;
    return {
      state: { ...state, money: nextMoney.toString(), upgradeLevels, sequence: nextSequence },
      events: [{
        type: "upgrade_purchased",
        stateSequence: nextSequence,
        data: { upgradeId, count: purchase.count, cost: purchase.cost.toString() },
      }],
    };
  }
}
