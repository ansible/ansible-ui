/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaSelectRolesStep } from './EdaSelectRolesStep';

describe('EdaSelectRolesStep', () => {
  it('should export the EdaSelectRolesStep component', () => {
    expect(EdaSelectRolesStep).toBeDefined();
    expect(typeof EdaSelectRolesStep).toBe('function');
  });
});
