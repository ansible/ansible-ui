/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaProjectAddUsers } from './EdaProjectAddUsers';

describe('EdaProjectAddUsers', () => {
  it('exports the EdaProjectAddUsers component', () => {
    expect(EdaProjectAddUsers).toBeDefined();
    expect(typeof EdaProjectAddUsers).toBe('function');
  });
});
