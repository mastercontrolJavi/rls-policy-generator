import { detectRisks } from "./risks";
import { droppedScopedOps, generatePolicies } from "./sql-generator";
import type { AppState } from "./types";
import { errorsOf, isSchemaEmpty, validateSchema } from "./validation";

export type PostureLevel = "empty" | "error" | "warn" | "ok";

export interface Posture {
  level: PostureLevel;
  policies: number;
  warnings: number;
  errors: number;
  label: string;
}

/** One-line read on whether the current config is safe to ship. */
export function assessPosture(state: AppState): Posture {
  if (isSchemaEmpty(state.schema)) {
    return { level: "empty", policies: 0, warnings: 0, errors: 0, label: "no table" };
  }

  const errors = errorsOf(validateSchema(state.schema)).length;
  if (errors > 0) {
    return {
      level: "error",
      policies: 0,
      warnings: 0,
      errors,
      label: `${errors} ${errors === 1 ? "error" : "errors"}`,
    };
  }

  const policies = generatePolicies(state).length;
  // Enabled scoped rules that generated nothing count as a warning, so the
  // chip cannot read healthy while access rules are being dropped.
  const dropped = droppedScopedOps(state).length > 0 ? 1 : 0;
  const warnings = detectRisks(state.rules).length + dropped;

  if (policies === 0) {
    return { level: "warn", policies: 0, warnings, errors: 0, label: "no policies" };
  }

  const base = `${policies} ${policies === 1 ? "policy" : "policies"}`;
  if (warnings > 0) {
    return {
      level: "warn",
      policies,
      warnings,
      errors: 0,
      label: `${base} · ${warnings} ${warnings === 1 ? "warning" : "warnings"}`,
    };
  }
  return { level: "ok", policies, warnings: 0, errors: 0, label: base };
}
