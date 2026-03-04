/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformOrganizationDetails } from './PlatformOrganizationDetails';

describe('PlatformOrganizationDetails', () => {
  it('exports the PlatformOrganizationDetails component', () => {
    expect(PlatformOrganizationDetails).toBeDefined();
    expect(typeof PlatformOrganizationDetails).toBe('function');
  });
});
