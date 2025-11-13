import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Spec } from '../../../interfaces/Survey';
import { useDeleteSurveyDialog } from './useDeleteSurveyDialog';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageDialog: () => [undefined, vi.fn()],
  usePageAlertToaster: () => ({
    addAlert: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ id: '123' }),
}));

vi.mock('./useDeleteSurvey', () => ({
  useDeleteSurvey: vi.fn(() => vi.fn()),
}));

vi.mock('./useSurveyColumns', () => ({
  useSurveyColumns: vi.fn(() => []),
}));

describe('useDeleteSurveyDialog', () => {
  const mockOnComplete = vi.fn();
  const mockSurveyQuestions: Spec[] = [
    {
      question_name: 'Question 1',
      question_description: 'Description 1',
      variable: 'var1',
      type: 'text',
      required: true,
      min: 0,
      max: 100,
      default: 'default1',
      choices: [],
      new_question: false,
    },
    {
      question_name: 'Question 2',
      question_description: 'Description 2',
      variable: 'var2',
      type: 'integer',
      required: false,
      min: 0,
      max: 100,
      default: 42,
      choices: [],
      new_question: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns a function', () => {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, 'job_template'));

    expect(typeof result.current).toBe('function');
  });

  test('can be called with survey questions', () => {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, 'job_template'));

    expect(() => result.current(mockSurveyQuestions)).not.toThrow();
  });

  test('accepts workflow_job_template as templateType', () => {
    const { result } = renderHook(() =>
      useDeleteSurveyDialog(mockOnComplete, 'workflow_job_template')
    );

    expect(typeof result.current).toBe('function');
  });

  test('accepts job_template as templateType', () => {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, 'job_template'));

    expect(typeof result.current).toBe('function');
  });

  test('handles empty questions array', () => {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, 'job_template'));

    expect(() => result.current([])).not.toThrow();
  });

  test('handles single question', () => {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, 'job_template'));

    expect(() => result.current([mockSurveyQuestions[0]])).not.toThrow();
  });
});
