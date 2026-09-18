import { describe, expect, it } from 'vitest';
import { getCopyResourceName, getCopySourceName, hasCopyNamePattern } from './copyResourceName';

/** JS-consumable approximation of CleanTextMixin's validate_resource_name allowlist. */
const TIER1_NAME_RE = /^[\p{L}\p{N}_][\p{L}\p{N}\p{M}_ .@-]{0,511}$/u;

describe('getCopyResourceName', () => {
  it('appends @ and a colon-free timestamp', () => {
    const now = new Date(2026, 8, 18, 13, 34, 38);
    expect(getCopyResourceName('wf', now)).toBe('wf @ 13-34-38');
  });

  it('zero-pads hours, minutes, and seconds', () => {
    const now = new Date(2026, 8, 18, 1, 2, 3);
    expect(getCopyResourceName('job', now)).toBe('job @ 01-02-03');
  });

  it('satisfies the CleanTextMixin Tier 1 allowlist', () => {
    const copied = getCopyResourceName('wf', new Date(2026, 8, 18, 13, 34, 38));
    expect(copied).toMatch(TIER1_NAME_RE);
    expect(copied).not.toContain(':');
  });

  it('rejects the legacy colon timestamp against Tier 1', () => {
    expect('wf @ 13:34:38').not.toMatch(TIER1_NAME_RE);
  });
});

describe('hasCopyNamePattern', () => {
  it('matches the current hyphenated @ timestamp suffix', () => {
    expect(hasCopyNamePattern('Activation 1 @ 12-00-00')).toBe(true);
  });

  it('matches the legacy colon @ timestamp suffix so existing copies still warn', () => {
    expect(hasCopyNamePattern('Activation 1 @ 12:00:00')).toBe(true);
  });

  it('returns false for original names and missing values', () => {
    expect(hasCopyNamePattern('Activation 1')).toBe(false);
    expect(hasCopyNamePattern('Activation 1 @')).toBe(false);
    expect(hasCopyNamePattern()).toBe(false);
    expect(hasCopyNamePattern('')).toBe(false);
  });
});

describe('getCopySourceName', () => {
  it('strips the current hyphenated @ timestamp suffix', () => {
    expect(getCopySourceName('Activation 1 @ 12-00-00')).toBe('Activation 1');
  });

  it('strips the legacy colon @ timestamp suffix', () => {
    expect(getCopySourceName('Activation 1 @ 12:00:00')).toBe('Activation 1');
  });

  it('returns the name unchanged when it is not a copy', () => {
    expect(getCopySourceName('Activation 1')).toBe('Activation 1');
  });
});
