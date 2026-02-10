/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformTeamAdmins } from './PlatformTeamAdmins';

describe('PlatformTeamAdmins', () => {
  it('exports the PlatformTeamAdmins component', () => {
    expect(PlatformTeamAdmins).toBeDefined();
    expect(typeof PlatformTeamAdmins).toBe('function');
  });
});
