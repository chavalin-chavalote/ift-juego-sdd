import Decimal from "decimal.js";

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP, toExpNeg: -9, toExpPos: 18 });

export type DecimalString = string;

export class BigNumber {
  private readonly value: Decimal;

  private constructor(value: Decimal) {
    if (!value.isFinite()) throw new Error("BigNumber must be finite");
    this.value = value;
  }

  static from(value: DecimalString | number | Decimal): BigNumber {
    const parsed = new Decimal(value as Decimal.Value);
    if (parsed.isNaN() || !parsed.isFinite()) throw new Error("Invalid BigNumber");
    return new BigNumber(parsed);
  }

  static zero(): BigNumber {
    return BigNumber.from("0");
  }

  add(other: BigNumber): BigNumber {
    return BigNumber.from(this.value.plus(other.value));
  }

  sub(other: BigNumber): BigNumber {
    return BigNumber.from(this.value.minus(other.value));
  }

  mul(other: BigNumber): BigNumber {
    return BigNumber.from(this.value.times(other.value));
  }

  div(other: BigNumber): BigNumber {
    if (other.value.isZero()) throw new Error("Division by zero");
    return BigNumber.from(this.value.div(other.value));
  }

  pow(exponent: number): BigNumber {
    return BigNumber.from(this.value.pow(exponent));
  }

  cmp(other: BigNumber): number {
    return this.value.comparedTo(other.value);
  }

  toString(): DecimalString {
    return this.value.toString();
  }

  toDecimal(): Decimal {
    return this.value;
  }

  floor(): BigNumber {
    return BigNumber.from(this.value.floor());
  }
}
