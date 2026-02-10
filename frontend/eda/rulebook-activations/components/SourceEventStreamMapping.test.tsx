/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { SourceEventStreamMapping } from './SourceEventStreamMapping';

describe('SourceEventStreamMapping', () => {
  it('exports the SourceEventStreamMapping component', () => {
    expect(SourceEventStreamMapping).toBeDefined();
    expect(typeof SourceEventStreamMapping).toBe('function');
  });
});
