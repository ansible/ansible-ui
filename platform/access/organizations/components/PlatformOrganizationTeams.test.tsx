/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformOrganizationTeams } from './PlatformOrganizationTeams';

describe('PlatformOrganizationTeams', () => {
  it('exports the PlatformOrganizationTeams component', () => {
    expect(PlatformOrganizationTeams).toBeDefined();
    expect(typeof PlatformOrganizationTeams).toBe('function');
  });
});
