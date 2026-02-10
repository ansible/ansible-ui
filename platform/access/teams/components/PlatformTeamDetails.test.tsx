/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformTeamDetails } from './PlatformTeamDetails';

describe('PlatformTeamDetails', () => {
  it('exports the PlatformTeamDetails component', () => {
    expect(PlatformTeamDetails).toBeDefined();
    expect(typeof PlatformTeamDetails).toBe('function');
  });
});
