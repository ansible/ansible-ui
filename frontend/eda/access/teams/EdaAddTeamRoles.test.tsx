/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaAddTeamRoles } from './EdaAddTeamRoles';

describe('EdaAddTeamRoles', () => {
  it('exports the EdaAddTeamRoles component', () => {
    expect(EdaAddTeamRoles).toBeDefined();
    expect(typeof EdaAddTeamRoles).toBe('function');
  });
});
