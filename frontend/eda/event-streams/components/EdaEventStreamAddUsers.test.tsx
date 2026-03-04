/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaEventStreamAddUsers } from './EdaEventStreamAddUsers';

describe('EdaEventStreamAddUsers', () => {
  it('exports the EdaEventStreamAddUsers component', () => {
    expect(EdaEventStreamAddUsers).toBeDefined();
    expect(typeof EdaEventStreamAddUsers).toBe('function');
  });
});
