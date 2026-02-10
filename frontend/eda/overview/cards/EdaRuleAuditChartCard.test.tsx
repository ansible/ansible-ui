/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { RuleAuditChart } from './EdaRuleAuditChartCard';

describe('EdaRuleAuditChartCard', () => {
  it('exports the RuleAuditChart component', () => {
    expect(RuleAuditChart).toBeDefined();
    expect(typeof RuleAuditChart).toBe('function');
  });
});
