/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaEventStreamAssignTeams } from './EdaEventStreamAssignTeams';

describe('EdaEventStreamAssignTeams', () => {
  it('exports the EdaEventStreamAssignTeams component', () => {
    expect(EdaEventStreamAssignTeams).toBeDefined();
    expect(typeof EdaEventStreamAssignTeams).toBe('function');
  });
});
