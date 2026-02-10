/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { SubscriptionDetails } from './SubscriptionDetails';

describe('SubscriptionDetails', () => {
  it('exports the SubscriptionDetails component', () => {
    expect(SubscriptionDetails).toBeDefined();
    expect(typeof SubscriptionDetails).toBe('function');
  });
});
