/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { EdaRecentProjectsCard } from './EdaProjectsCard';

describe('EdaProjectsCard', () => {
  it('exports the EdaRecentProjectsCard component', () => {
    expect(EdaRecentProjectsCard).toBeDefined();
    expect(typeof EdaRecentProjectsCard).toBe('function');
  });
});
