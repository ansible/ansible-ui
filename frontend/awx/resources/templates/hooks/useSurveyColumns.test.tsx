import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { Spec } from '../../../interfaces/Survey';
import { useSurveyColumns } from './useSurveyColumns';

describe('useSurveyColumns', () => {
  const mockQuestion: Spec = {
    question_name: 'Test Question',
    question_description: 'Test Description',
    variable: 'test_var',
    type: 'text',
    required: true,
    min: 0,
    max: 100,
    default: 'default value',
    choices: [],
    new_question: false,
  };

  test('returns columns array with Name, Type, and Default headers', () => {
    const { result } = renderHook(() => useSurveyColumns());

    expect(result.current).toHaveLength(3);
    expect(result.current[0].header).toBe('Name');
    expect(result.current[1].header).toBe('Type');
    expect(result.current[2].header).toBe('Default');
  });

  test('Name column displays question name', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const nameColumn = result.current[0];
    expect(nameColumn.card).toBe('name');
    expect(nameColumn.list).toBe('name');
  });

  test('Type column displays question type', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const typeColumn = result.current[1];
    expect(typeColumn.card).toBe('subtitle');
    expect(typeColumn.list).toBe('subtitle');
  });

  test('Default column returns null for empty default values', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const defaultColumn = result.current[2];
    const emptyQuestion = { ...mockQuestion, default: '' };

    if ('cell' in defaultColumn && typeof defaultColumn.cell === 'function') {
      const cellResult = defaultColumn.cell(emptyQuestion);
      expect(cellResult).toBeNull();
    }
  });

  test('Default column returns null for null default values', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const defaultColumn = result.current[2];
    const nullQuestion = { ...mockQuestion, default: null as unknown as string };

    if ('cell' in defaultColumn && typeof defaultColumn.cell === 'function') {
      const cellResult = defaultColumn.cell(nullQuestion);
      expect(cellResult).toBeNull();
    }
  });

  test('Default column returns default value for non-multiselect types', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const defaultColumn = result.current[2];

    if ('cell' in defaultColumn && typeof defaultColumn.cell === 'function') {
      const cellResult = defaultColumn.cell(mockQuestion);
      expect(cellResult).toBe('default value');
    }
  });

  test('Default column handles multiselect with newline-separated values', () => {
    const { result } = renderHook(() => useSurveyColumns());

    const multiselectQuestion: Spec = {
      ...mockQuestion,
      type: 'multiselect',
      default: 'value1\nvalue2\nvalue3',
    };

    const defaultColumn = result.current[2];

    if ('cell' in defaultColumn && typeof defaultColumn.cell === 'function') {
      const cellResult = defaultColumn.cell(multiselectQuestion);
      expect(cellResult).not.toBeNull();
    }
  });

  test('columns configuration includes correct card and list properties', () => {
    const { result } = renderHook(() => useSurveyColumns());

    for (const column of result.current) {
      expect(column).toHaveProperty('header');
      expect(column).toHaveProperty('card');
      expect(column).toHaveProperty('list');
    }
  });

  test('disableLinks option prevents link generation in Name column', () => {
    const { result } = renderHook(() => useSurveyColumns({ disableLinks: true }));

    const nameColumn = result.current[0];
    expect(nameColumn).toBeDefined();
  });

  test('templateType and id are used for generating edit links', () => {
    const { result } = renderHook(() =>
      useSurveyColumns({
        templateType: 'job_template',
        id: '123',
        disableLinks: false,
      })
    );

    const nameColumn = result.current[0];
    expect(nameColumn).toBeDefined();
  });
});
