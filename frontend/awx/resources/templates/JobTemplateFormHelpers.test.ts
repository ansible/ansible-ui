import { describe, test, expect } from 'vitest';
import { getJobTemplateDefaultValues } from './JobTemplateFormHelpers';
import { JobTemplate } from '../../interfaces/JobTemplate';

describe('getJobTemplateDefaultValues', () => {
  const mockTranslate = (str: string) => str;

  test('handles template with null project in summary_fields', () => {
    const template = {
      id: 1,
      name: 'Test Template',
      description: 'Test description',
      inventory: 1,
      playbook: 'test.yml',
      summary_fields: {
        project: null,
      },
    } as unknown as JobTemplate;

    const result = getJobTemplateDefaultValues(mockTranslate, template);

    expect(result).toBeDefined();
    expect(result?.project).toBeUndefined();
  });

  test('handles template with undefined project in summary_fields', () => {
    const template = {
      id: 1,
      name: 'Test Template',
      description: 'Test description',
      inventory: 1,
      playbook: 'test.yml',
      summary_fields: {
        project: undefined,
      },
    } as unknown as JobTemplate;

    const result = getJobTemplateDefaultValues(mockTranslate, template);

    expect(result).toBeDefined();
    expect(result?.project).toBeUndefined();
  });

  test('handles template with valid project in summary_fields', () => {
    const template = {
      id: 1,
      name: 'Test Template',
      description: 'Test description',
      inventory: 1,
      playbook: 'test.yml',
      summary_fields: {
        project: {
          id: 42,
          name: 'Demo Project',
        },
      },
    } as unknown as JobTemplate;

    const result = getJobTemplateDefaultValues(mockTranslate, template);

    expect(result).toBeDefined();
    expect(result?.project).toBe(42);
  });

  test('handles template with missing summary_fields', () => {
    const template = {
      id: 1,
      name: 'Test Template',
      description: 'Test description',
      inventory: 1,
      playbook: 'test.yml',
      summary_fields: undefined,
    } as unknown as JobTemplate;

    const result = getJobTemplateDefaultValues(mockTranslate, template);

    expect(result).toBeDefined();
    expect(result?.project).toBeUndefined();
  });
});
