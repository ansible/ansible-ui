/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformOrganizationForm } from './PlatformOrganizationForm';

describe('PlatformOrganizationForm', () => {
  it('exports the PlatformOrganizationForm component', () => {
    expect(PlatformOrganizationForm).toBeDefined();
    expect(typeof PlatformOrganizationForm).toBe('function');
  });
});
