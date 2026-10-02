/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaContentType } from './EdaContentType';

describe('EdaContentType', () => {
  it('should export all expected content types', () => {
    expect(Object.keys(EdaContentType)).toEqual(
      expect.arrayContaining([
        'Activation',
        'AuditRule',
        'Credential',
        'DecisionEnvironment',
        'EventStream',
        'Project',
        'Rulebook',
        'RulebookProcess',
        'Organization',
        'Team',
      ])
    );
  });

  it('should map content types to correct EDA API values', () => {
    expect(EdaContentType.Activation).toBe('eda.activation');
    expect(EdaContentType.AuditRule).toBe('eda.auditrule');
    expect(EdaContentType.Credential).toBe('eda.edacredential');
    expect(EdaContentType.DecisionEnvironment).toBe('eda.decisionenvironment');
    expect(EdaContentType.EventStream).toBe('eda.eventstream');
    expect(EdaContentType.Project).toBe('eda.project');
    expect(EdaContentType.Rulebook).toBe('eda.rulebook');
    expect(EdaContentType.RulebookProcess).toBe('eda.rulebookprocess');
  });

  it('should include shared content types', () => {
    expect(EdaContentType.Organization).toBe('shared.organization');
    expect(EdaContentType.Team).toBe('shared.team');
  });
});
