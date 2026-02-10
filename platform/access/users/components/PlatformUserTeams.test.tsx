/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformUserTeams } from './PlatformUserTeams';

describe('PlatformUserTeams', () => {
  it('exports the PlatformUserTeams component', () => {
    expect(PlatformUserTeams).toBeDefined();
    expect(typeof PlatformUserTeams).toBe('function');
  });
});
