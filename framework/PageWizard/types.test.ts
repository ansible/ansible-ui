import { describe, expect, it } from 'vitest';
import { isWizardSupplementalData } from './types';

describe('isWizardSupplementalData', () => {
  it('accepts plain supplemental objects', () => {
    expect(isWizardSupplementalData({ showPrompts: true })).toBe(true);
    expect(isWizardSupplementalData(Object.create(null))).toBe(true);
  });

  it('rejects arrays, null, and undefined', () => {
    expect(isWizardSupplementalData(['ignored'])).toBe(false);
    expect(isWizardSupplementalData(null)).toBe(false);
    expect(isWizardSupplementalData(undefined)).toBe(false);
  });

  it('rejects class instances such as Error and Date', () => {
    expect(isWizardSupplementalData(new Error('fail'))).toBe(false);
    expect(isWizardSupplementalData(new Date())).toBe(false);
  });

  it('rejects objects with a non-plain prototype', () => {
    class SupplementalBag {
      flag = true;
    }
    expect(isWizardSupplementalData(new SupplementalBag())).toBe(false);
  });
});
