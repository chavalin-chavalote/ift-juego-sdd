import { BigNumber, type DecimalString } from "../numbers/BigNumber";

export interface UpgradeLevels {
  readonly [upgradeId: string]: number;
}

export interface GameState {
  readonly money: DecimalString;
  readonly eraIndex: number;
  readonly elapsedSeconds: number;
  readonly totalProduced: DecimalString;
  readonly upgradeLevels: UpgradeLevels;
  readonly sequence: number;
}

export function createInitialGameState(): GameState {
  return {
    money: "10",
    eraIndex: 1,
    elapsedSeconds: 0,
    totalProduced: "0",
    upgradeLevels: {},
    sequence: 0,
  };
}

export function moneyOf(state: GameState): BigNumber {
  return BigNumber.from(state.money);
}
