import { BigNumber } from "./BigNumber";

export function formatBigNumber(value: BigNumber, decimals = 2): string {
  const decimal = value.toDecimal();
  const absolute = decimal.abs();
  if (absolute.isZero()) return "0";

  const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi"];
  const exponent = absolute.gte(1000)
    ? Math.min(Math.floor(absolute.log(1000).toNumber()), suffixes.length - 1)
    : 0;
  if (exponent === 0) return decimal.toFixed(Math.min(decimals, 2)).replace(/\.?0+$/, "");

  if (exponent < suffixes.length - 1 || absolute.lt("1e21")) {
    const scaled = absolute.div(1000 ** exponent);
    return `${scaled.toFixed(decimals).replace(/\.?0+$/, "")}${suffixes[exponent]}`;
  }
  return decimal.toExponential(decimals).replace(/\.?0+(?=e)/, "");
}
