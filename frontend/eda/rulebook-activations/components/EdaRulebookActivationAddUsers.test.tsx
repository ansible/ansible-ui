/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaRulebookActivationAddUsers } from './EdaRulebookActivationAddUsers';

describe('EdaRulebookActivationAddUsers', () => {
  it('exports the EdaRulebookActivationAddUsers component', () => {
    expect(EdaRulebookActivationAddUsers).toBeDefined();
    expect(typeof EdaRulebookActivationAddUsers).toBe('function');
  });
});
