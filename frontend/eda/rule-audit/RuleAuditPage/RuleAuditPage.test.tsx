/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { RuleAuditPage } from './RuleAuditPage';

describe('RuleAuditPage', () => {
  it('exports the RuleAuditPage component', () => {
    expect(RuleAuditPage).toBeDefined();
    expect(typeof RuleAuditPage).toBe('function');
  });
});
