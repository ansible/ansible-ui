/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaDecisionEnvironmentAssignTeams } from './EdaDecisionEnvironmentAssignTeams';

describe('EdaDecisionEnvironmentAssignTeams', () => {
  it('exports the EdaDecisionEnvironmentAssignTeams component', () => {
    expect(EdaDecisionEnvironmentAssignTeams).toBeDefined();
    expect(typeof EdaDecisionEnvironmentAssignTeams).toBe('function');
  });
});
