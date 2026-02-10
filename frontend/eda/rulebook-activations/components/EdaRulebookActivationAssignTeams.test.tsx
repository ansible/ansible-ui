/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaRulebookActivationAssignTeams } from './EdaRulebookActivationAssignTeams';

describe('EdaRulebookActivationAssignTeams', () => {
  it('exports the EdaRulebookActivationAssignTeams component', () => {
    expect(EdaRulebookActivationAssignTeams).toBeDefined();
    expect(typeof EdaRulebookActivationAssignTeams).toBe('function');
  });
});
