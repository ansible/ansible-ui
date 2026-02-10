/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformOrganizationAdmins } from './PlatformOrganizationAdmins';

describe('PlatformOrganizationAdmins', () => {
  it('exports the PlatformOrganizationAdmins component', () => {
    expect(PlatformOrganizationAdmins).toBeDefined();
    expect(typeof PlatformOrganizationAdmins).toBe('function');
  });
});
