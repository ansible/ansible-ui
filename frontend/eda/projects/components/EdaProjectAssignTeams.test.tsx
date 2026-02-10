/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaProjectAssignTeams } from './EdaProjectAssignTeams';

describe('EdaProjectAssignTeams', () => {
  it('exports the EdaProjectAssignTeams component', () => {
    expect(EdaProjectAssignTeams).toBeDefined();
    expect(typeof EdaProjectAssignTeams).toBe('function');
  });
});
