import { z } from "zod";
import type { GameState } from "../state/GameState";

export const SAVE_VERSION = 1;

export interface SaveEnvelope {
  readonly format: "idle-farm";
  readonly version: number;
  readonly savedAt: number;
  readonly checksum: string;
  readonly state: GameState;
}

const SaveSchema = z.object({
  format: z.literal("idle-farm"),
  version: z.number().int(),
  savedAt: z.number().finite(),
  checksum: z.string().regex(/^[0-9a-f]{8}$/),
  state: z.object({
    money: z.string(),
    eraIndex: z.number().int().positive(),
    elapsedSeconds: z.number().finite().nonnegative(),
    totalProduced: z.string(),
    upgradeLevels: z.record(z.string(), z.number().int().nonnegative()),
    sequence: z.number().int().nonnegative(),
  }),
});

export function checksum(payload: string): string {
  let hash = 2166136261;
  for (let index = 0; index < payload.length; index++) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function encodeSave(state: GameState, savedAt = Date.now()): string {
  const stateJson = JSON.stringify(state);
  const envelope: SaveEnvelope = {
    format: "idle-farm",
    version: SAVE_VERSION,
    savedAt,
    checksum: checksum(stateJson),
    state,
  };
  return JSON.stringify(envelope);
}

export function decodeSave(serialized: string): SaveEnvelope {
  const parsed: unknown = JSON.parse(serialized);
  const envelope = SaveSchema.parse(parsed) as SaveEnvelope;
  if (envelope.version !== SAVE_VERSION) throw new Error(`Unsupported save version: ${envelope.version}`);
  const stateJson = JSON.stringify(envelope.state);
  if (checksum(stateJson) !== envelope.checksum) throw new Error("Save checksum mismatch");
  return envelope;
}
