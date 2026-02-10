/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaAddUserRoles } from './EdaAddUserRoles';

describe('EdaAddUserRoles', () => {
  it('exports the EdaAddUserRoles component', () => {
    expect(EdaAddUserRoles).toBeDefined();
    expect(typeof EdaAddUserRoles).toBe('function');
  });
});
