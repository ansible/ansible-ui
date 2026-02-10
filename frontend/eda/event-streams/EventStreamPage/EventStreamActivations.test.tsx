/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EventStreamActivations } from './EventStreamActivations';

describe('EventStreamActivations', () => {
  it('exports the EventStreamActivations component', () => {
    expect(EventStreamActivations).toBeDefined();
    expect(typeof EventStreamActivations).toBe('function');
  });
});
