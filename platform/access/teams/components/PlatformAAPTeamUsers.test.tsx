/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformAAPTeamUsers } from './PlatformAAPTeamUsers';

describe('PlatformAAPTeamUsers', () => {
  it('exports the PlatformAAPTeamUsers component', () => {
    expect(PlatformAAPTeamUsers).toBeDefined();
    expect(typeof PlatformAAPTeamUsers).toBe('function');
  });
});
