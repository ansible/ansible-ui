/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaCredentialAssignTeams } from './EdaCredentialAssignTeams';

describe('EdaCredentialAssignTeams', () => {
  it('exports the EdaCredentialAssignTeams component', () => {
    expect(EdaCredentialAssignTeams).toBeDefined();
    expect(typeof EdaCredentialAssignTeams).toBe('function');
  });
});
