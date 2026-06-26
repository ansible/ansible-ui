/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaAddRoles } from './EdaAddRoles';

describe('EdaAddRoles', () => {
  it('should export the EdaAddRoles component', () => {
    expect(EdaAddRoles).toBeDefined();
    expect(typeof EdaAddRoles).toBe('function');
  });
});
