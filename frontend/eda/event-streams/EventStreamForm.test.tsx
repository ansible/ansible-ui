/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreateEventStream, EditEventStream } from './EventStreamForm';

describe('EventStreamForm', () => {
  it('exports the CreateEventStream component', () => {
    expect(CreateEventStream).toBeDefined();
    expect(typeof CreateEventStream).toBe('function');
  });

  it('exports the EditEventStream component', () => {
    expect(EditEventStream).toBeDefined();
    expect(typeof EditEventStream).toBe('function');
  });
});
