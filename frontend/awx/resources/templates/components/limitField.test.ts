import { describe, expect, it } from 'vitest';
import {
  applyLimitSelection,
  getSimpleLimitNames,
  hasAdvancedLimitPatterns,
  isSimpleInventoryName,
  parseLimitTokens,
  uniqueNames,
} from './limitField';

describe('isSimpleInventoryName', () => {
  it('accepts explicit host and group names', () => {
    expect(isSimpleInventoryName('web01')).toBe(true);
    expect(isSimpleInventoryName('web01.example.com')).toBe(true);
    expect(isSimpleInventoryName('web_servers')).toBe(true);
    expect(isSimpleInventoryName('192.168.1.10')).toBe(true);
  });

  it('rejects Ansible pattern operators and IPv6', () => {
    expect(isSimpleInventoryName('web*')).toBe(false);
    expect(isSimpleInventoryName('web?1')).toBe(false);
    expect(isSimpleInventoryName('web[01:03]')).toBe(false);
    expect(isSimpleInventoryName('!web01')).toBe(false);
    expect(isSimpleInventoryName('webservers:&dbservers')).toBe(false);
    expect(isSimpleInventoryName('webservers:dbservers')).toBe(false);
    expect(isSimpleInventoryName('~web\\d+')).toBe(false);
    expect(isSimpleInventoryName('fe80::1')).toBe(false);
    expect(isSimpleInventoryName('all')).toBe(false);
    expect(isSimpleInventoryName('ALL')).toBe(false);
    expect(isSimpleInventoryName('*')).toBe(false);
    expect(isSimpleInventoryName('')).toBe(false);
  });
});

describe('parseLimitTokens', () => {
  it('returns no tokens for empty input', () => {
    expect(parseLimitTokens('')).toEqual([]);
    expect(parseLimitTokens('   ')).toEqual([]);
    expect(parseLimitTokens(null)).toEqual([]);
    expect(parseLimitTokens(undefined)).toEqual([]);
  });

  it('splits comma-separated explicit names', () => {
    expect(parseLimitTokens('web01,web02,web03')).toEqual([
      { kind: 'simple', name: 'web01' },
      { kind: 'simple', name: 'web02' },
      { kind: 'simple', name: 'web03' },
    ]);
  });

  it('trims whitespace around tokens', () => {
    expect(parseLimitTokens(' web01 , web02 ')).toEqual([
      { kind: 'simple', name: 'web01' },
      { kind: 'simple', name: 'web02' },
    ]);
  });

  it('keeps advanced patterns intact instead of splitting them into names', () => {
    expect(parseLimitTokens('web*,web01,!db01')).toEqual([
      { kind: 'advanced', raw: 'web*' },
      { kind: 'simple', name: 'web01' },
      { kind: 'advanced', raw: '!db01' },
    ]);
    expect(parseLimitTokens('fe80::1,web01')).toEqual([
      { kind: 'advanced', raw: 'fe80::1' },
      { kind: 'simple', name: 'web01' },
    ]);
  });
});

describe('getSimpleLimitNames', () => {
  it('returns unique explicit names in order', () => {
    expect(getSimpleLimitNames('web01,web*,web01,web02')).toEqual(['web01', 'web02']);
  });
});

describe('hasAdvancedLimitPatterns', () => {
  it('detects mixed and advanced-only limits', () => {
    expect(hasAdvancedLimitPatterns('web01,web02')).toBe(false);
    expect(hasAdvancedLimitPatterns('web*')).toBe(true);
    expect(hasAdvancedLimitPatterns('web01,!db01')).toBe(true);
  });
});

describe('uniqueNames', () => {
  it('preserves first-seen order', () => {
    expect(uniqueNames(['b', 'a', 'b'])).toEqual(['b', 'a']);
  });
});

describe('applyLimitSelection', () => {
  it('returns the original string when the matched selection did not change', () => {
    expect(applyLimitSelection(' web01 , web02 ', ['web01', 'web02'], ['web01', 'web02'])).toBe(
      ' web01 , web02 '
    );
  });

  it('returns the original empty value when nothing was selected', () => {
    expect(applyLimitSelection('', [], [])).toBe('');
  });

  it('removes a deselected matched name', () => {
    expect(
      applyLimitSelection('web01,web02,web03', ['web01', 'web03'], ['web01', 'web02', 'web03'])
    ).toBe('web01,web03');
  });

  it('appends newly selected names', () => {
    expect(applyLimitSelection('web01', ['web01', 'web02'], ['web01'])).toBe('web01,web02');
  });

  it('preserves advanced patterns while editing simple names', () => {
    expect(applyLimitSelection('web*,web01,!db01', [], ['web01'])).toBe('web*,!db01');
    expect(applyLimitSelection('web*,web01', ['web01', 'web02'], ['web01'])).toBe(
      'web*,web01,web02'
    );
  });

  it('preserves unmatched simple names that cannot be shown as checkboxes', () => {
    expect(applyLimitSelection('missing-host,web01', ['web01'], ['web01'])).toBe(
      'missing-host,web01'
    );
    expect(applyLimitSelection('missing-host,web01', [], ['web01'])).toBe('missing-host');
  });

  it('does not expand wildcards, exclusions, ranges, regex, or IPv6', () => {
    expect(applyLimitSelection('web*', ['web01'], [])).toBe('web*,web01');
    expect(applyLimitSelection('!web01', ['web02'], [])).toBe('!web01,web02');
    expect(applyLimitSelection('web[01:03]', ['web01'], [])).toBe('web[01:03],web01');
    expect(applyLimitSelection('~web\\d+', ['web01'], [])).toBe('~web\\d+,web01');
    expect(applyLimitSelection('fe80::1', ['web01'], [])).toBe('fe80::1,web01');
  });

  it('does not carry matched names from a previous inventory when none match', () => {
    expect(applyLimitSelection('web01,web02', [], [])).toBe('web01,web02');
    expect(applyLimitSelection('web01,web02', ['db01'], [])).toBe('web01,web02,db01');
  });

  it('keeps unmatched names when the user did not remove them', () => {
    expect(applyLimitSelection('web01,web02,db01', ['db01'], ['db01'])).toBe('web01,web02,db01');
  });

  it('removes unmatched names the user dropped in the picker', () => {
    expect(applyLimitSelection('web01,web02,db01', ['db01'], ['db01'], ['web01', 'web02'])).toBe(
      'db01'
    );
  });

  it('preserves advanced patterns when unmatched names are removed', () => {
    expect(applyLimitSelection('web*,missing,web01', ['web01'], ['web01'], ['missing'])).toBe(
      'web*,web01'
    );
  });

  it('can leave Limit empty when every remaining name is removed', () => {
    expect(applyLimitSelection('web01,web02', [], [], ['web01', 'web02'])).toBe('');
  });
});
