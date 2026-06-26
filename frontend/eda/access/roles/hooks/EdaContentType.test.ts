/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaContentType } from './EdaContentType';

describe('EdaContentType', () => {
  it('should have Activation content type', () => {
    expect(EdaContentType.Activation).toBe('eda.activation');
  });

  it('should have AuditRule content type', () => {
    expect(EdaContentType.AuditRule).toBe('eda.auditrule');
  });

  it('should have Credential content type', () => {
    expect(EdaContentType.Credential).toBe('eda.edacredential');
  });

  it('should have DecisionEnvironment content type', () => {
    expect(EdaContentType.DecisionEnvironment).toBe('eda.decisionenvironment');
  });

  it('should have EventStream content type', () => {
    expect(EdaContentType.EventStream).toBe('eda.eventstream');
  });

  it('should have Project content type', () => {
    expect(EdaContentType.Project).toBe('eda.project');
  });

  it('should have Rulebook content type', () => {
    expect(EdaContentType.Rulebook).toBe('eda.rulebook');
  });

  it('should have RulebookProcess content type', () => {
    expect(EdaContentType.RulebookProcess).toBe('eda.rulebookprocess');
  });

  it('should have Organization content type from shared types', () => {
    expect(EdaContentType.Organization).toBe('shared.organization');
  });

  it('should have Team content type from shared types', () => {
    expect(EdaContentType.Team).toBe('shared.team');
  });

  it('should have all expected content types', () => {
    const expectedKeys = [
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
    ];

    for (const key of expectedKeys) {
      expect(EdaContentType[key as keyof typeof EdaContentType]).toBeDefined();
    }
  });
});
