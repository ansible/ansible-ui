/* eslint-disable i18next/no-literal-string */
import { describe, expect, it } from 'vitest';
import { CreateProject, EditProject } from './EditProject';

describe('EditProject', () => {
  it('exports the CreateProject component', () => {
    expect(CreateProject).toBeDefined();
    expect(typeof CreateProject).toBe('function');
  });

  it('exports the EditProject component', () => {
    expect(EditProject).toBeDefined();
    expect(typeof EditProject).toBe('function');
  });
});
