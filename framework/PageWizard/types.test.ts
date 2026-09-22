import { describe, expect, it } from 'vitest';
import { isWizardSupplementalData } from './types';

describe('isWizardSupplementalData', () => {
  it('accepts plain supplemental objects', () => {
    expect(isWizardSupplementalData({ showPrompts: true })).toBe(true);
  });

  it('rejects arrays, null, and undefined', () => {
    expect(isWizardSupplementalData(['ignored'])).toBe(false);
    expect(isWizardSupplementalData(null)).toBe(false);
    expect(isWizardSupplementalData(undefined)).toBe(false);
  });
});
