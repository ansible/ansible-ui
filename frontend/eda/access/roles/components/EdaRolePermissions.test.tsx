/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaRolePermissions } from './EdaRolePermissions';

describe('EdaRolePermissions', () => {
  it('exports the EdaRolePermissions component', () => {
    expect(EdaRolePermissions).toBeDefined();
    expect(typeof EdaRolePermissions).toBe('function');
  });
});
