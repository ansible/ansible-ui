/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { RuleAuditEvents } from './RuleAuditEvents';

describe('RuleAuditEvents', () => {
  it('exports the RuleAuditEvents component', () => {
    expect(RuleAuditEvents).toBeDefined();
    expect(typeof RuleAuditEvents).toBe('function');
  });
});
