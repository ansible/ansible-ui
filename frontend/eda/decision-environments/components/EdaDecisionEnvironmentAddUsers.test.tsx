/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaDecisionEnvironmentAddUsers } from './EdaDecisionEnvironmentAddUsers';

describe('EdaDecisionEnvironmentAddUsers', () => {
  it('exports the EdaDecisionEnvironmentAddUsers component', () => {
    expect(EdaDecisionEnvironmentAddUsers).toBeDefined();
    expect(typeof EdaDecisionEnvironmentAddUsers).toBe('function');
  });
});
