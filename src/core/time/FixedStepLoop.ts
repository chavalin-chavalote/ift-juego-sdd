export interface StepOptions {
  readonly fixedStepSeconds: number;
  readonly maxCatchUpSteps: number;
}

export class FixedStepLoop {
  private accumulator = 0;

  constructor(private readonly options: StepOptions) {
    if (options.fixedStepSeconds <= 0) throw new Error("fixedStepSeconds must be positive");
  }

  advance(realDeltaSeconds: number, step: (deltaSeconds: number) => void): number {
    if (!Number.isFinite(realDeltaSeconds) || realDeltaSeconds < 0) return 0;
    this.accumulator += realDeltaSeconds;
    let executed = 0;

    while (
      this.accumulator + Number.EPSILON >= this.options.fixedStepSeconds &&
      executed < this.options.maxCatchUpSteps
    ) {
      step(this.options.fixedStepSeconds);
      this.accumulator -= this.options.fixedStepSeconds;
      executed++;
    }

    if (executed === this.options.maxCatchUpSteps) this.accumulator = 0;
    return executed;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
