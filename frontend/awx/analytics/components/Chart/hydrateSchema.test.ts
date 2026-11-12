import { describe, expect, it } from 'vitest';
import { hydrateSchema } from './hydrateSchema';

describe('hydrateSchema', () => {
  const schema = [{ type: 'line', label: 'VAR_label', tooltip: 'VAR_tooltip' }] as const;

  it('returns the original schema when props are omitted', () => {
    const hydrate = hydrateSchema(schema as never);
    expect(hydrate(undefined as never)).toEqual(schema);
  });

  it('replaces VAR placeholders in the stringified schema', () => {
    const hydrate = hydrateSchema(schema as never);
    const result = hydrate({
      label: 'Jobs',
      tooltip: 'Job count',
      field: 'runs',
    } as never);

    expect(result[0]).toMatchObject({ label: 'Jobs', tooltip: 'Job count' });
  });
});
