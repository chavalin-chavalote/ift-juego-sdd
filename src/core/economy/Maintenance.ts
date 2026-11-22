import { BigNumber } from "../numbers/BigNumber";

export interface MaintenanceConfig {
  readonly buildingCost: string;
  readonly rate: number;
}

export function maintenancePerSecond(buildings: readonly MaintenanceConfig[]): BigNumber {
  return buildings.reduce(
    (total, building) =>
      total.add(BigNumber.from(building.buildingCost).mul(BigNumber.from(building.rate))),
    BigNumber.zero(),
  );
}

export function netIncome(grossIncomePerSecond: BigNumber, maintenancePerSecond: BigNumber): BigNumber {
  const net = grossIncomePerSecond.sub(maintenancePerSecond);
  return net.cmp(BigNumber.zero()) < 0 ? BigNumber.zero() : net;
}
