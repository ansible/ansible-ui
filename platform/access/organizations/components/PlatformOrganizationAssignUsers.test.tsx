/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformOrganizationAssignUsers } from './PlatformOrganizationAssignUsers';

describe('PlatformOrganizationAssignUsers', () => {
  it('exports the PlatformOrganizationAssignUsers component', () => {
    expect(PlatformOrganizationAssignUsers).toBeDefined();
    expect(typeof PlatformOrganizationAssignUsers).toBe('function');
  });
});
