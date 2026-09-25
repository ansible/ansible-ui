/** Plain-object data a step validate hook may return to merge into wizard state. */
export type WizardSupplementalData = Record<string, unknown>;

export function isWizardSupplementalData(value: unknown): value is WizardSupplementalData {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  if (value instanceof Date || value instanceof Error) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === null || prototype === Object.prototype;
}
