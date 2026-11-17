import { describe, expect, it } from 'vitest';
import { getPatternflyColor, PFColorE } from './pfcolors';

describe('pfcolors', () => {
  it('maps semantic colors to CSS variables', () => {
    expect(getPatternflyColor('success')).toContain('--pf-t--global--color--status--success');
    expect(getPatternflyColor('danger')).toContain('--pf-t--global--color--status--danger');
    expect(getPatternflyColor('warning')).toContain('--pf-t--global--color--status--warning');
    expect(getPatternflyColor('info')).toContain('--pf-t--global--color--status--info');
    expect(getPatternflyColor('disabled')).toContain('--pf-t--global--text--color--disabled');
    expect(getPatternflyColor('default')).toBeUndefined();
  });

  it('exports PFColorE enum values', () => {
    expect(PFColorE.Success).toBe('success');
    expect(PFColorE.Danger).toBe('danger');
  });
});
