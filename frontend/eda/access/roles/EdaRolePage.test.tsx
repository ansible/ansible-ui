/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaRolePage } from './EdaRolePage';

describe('EdaRolePage', () => {
  it('exports the EdaRolePage component', () => {
    expect(EdaRolePage).toBeDefined();
    expect(typeof EdaRolePage).toBe('function');
  });
});
