/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { PlatformUserDetails } from './PlatformUserDetails';

describe('PlatformUserDetails', () => {
  it('exports the PlatformUserDetails component', () => {
    expect(PlatformUserDetails).toBeDefined();
    expect(typeof PlatformUserDetails).toBe('function');
  });
});
