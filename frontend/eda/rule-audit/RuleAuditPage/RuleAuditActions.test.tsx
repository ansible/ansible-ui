/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { RuleAuditActions } from './RuleAuditActions';

describe('RuleAuditActions', () => {
  it('exports the RuleAuditActions component', () => {
    expect(RuleAuditActions).toBeDefined();
    expect(typeof RuleAuditActions).toBe('function');
  });
});
