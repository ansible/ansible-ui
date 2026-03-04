/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreateRulebookActivation, EditRulebookActivation } from './RulebookActivationForm';

describe('RulebookActivationForm', () => {
  it('exports the CreateRulebookActivation component', () => {
    expect(CreateRulebookActivation).toBeDefined();
    expect(typeof CreateRulebookActivation).toBe('function');
  });

  it('exports the EditRulebookActivation component', () => {
    expect(EditRulebookActivation).toBeDefined();
    expect(typeof EditRulebookActivation).toBe('function');
  });
});
