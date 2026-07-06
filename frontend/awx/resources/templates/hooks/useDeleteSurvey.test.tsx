/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteSurvey } from './useDeleteSurvey';
import type { Spec, Survey } from '../../../interfaces/Survey';

const mockDeleteRequest = vi.fn().mockResolvedValue(undefined);
const mockPostRequest = vi.fn().mockResolvedValue(undefined);

vi.mock('@ansible/common-ui/crud/useDeleteRequest', () => ({
  useDeleteRequest: vi.fn(() => mockDeleteRequest),
}));
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => mockPostRequest),
}));

const mockSurveyData: Survey = {
  name: 'Test Survey',
  description: 'A test survey',
  spec: [
    { question_name: 'Q1', variable: 'var1', type: 'text', required: true, default: '' },
    { question_name: 'Q2', variable: 'var2', type: 'text', required: false, default: '' },
    { question_name: 'Q3', variable: 'var3', type: 'text', required: false, default: '' },
  ] as Spec[],
};

vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGet: vi.fn(() => ({ data: mockSurveyData })),
}));

describe('useDeleteSurvey', () => {
  const mockOnClose = vi.fn();
  const mockOnComplete = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a function', () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    expect(typeof result.current).toBe('function');
  });

  test('should call deleteRequest when all questions are deleted', async () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    await result.current(mockSurveyData.spec);

    await waitFor(() => {
      expect(mockDeleteRequest).toHaveBeenCalledWith(
        expect.stringContaining('/job_templates/1/survey_spec/')
      );
    });
  });

  test('should call postRequest with remaining questions when subset is deleted', async () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    const questionsToDelete = [mockSurveyData.spec[0]] as Spec[];
    await result.current(questionsToDelete);

    await waitFor(() => {
      expect(mockPostRequest).toHaveBeenCalledWith(
        expect.stringContaining('/job_templates/1/survey_spec/'),
        expect.objectContaining({
          name: 'Test Survey',
          description: 'A test survey',
          spec: expect.any(Array),
        })
      );
    });
  });

  test('should use workflow_job_templates endpoint for workflow type', async () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '5',
        templateType: 'workflow_job_template',
      })
    );

    await result.current(mockSurveyData.spec);

    await waitFor(() => {
      expect(mockDeleteRequest).toHaveBeenCalledWith(
        expect.stringContaining('/workflow_job_templates/5/survey_spec/')
      );
    });
  });

  test('should call onComplete with the deleted questions', async () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    const questions = [mockSurveyData.spec[0]] as Spec[];
    await result.current(questions);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(questions);
    });
  });

  test('should call onClose after operation', async () => {
    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    await result.current([mockSurveyData.spec[0]] as Spec[]);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  test('should call onError when deleteRequest fails', async () => {
    const error = new Error('Delete failed');
    mockDeleteRequest.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    await result.current(mockSurveyData.spec);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  test('should call onError when postRequest fails', async () => {
    const error = new Error('Post failed');
    mockPostRequest.mockRejectedValueOnce(error);

    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    await result.current([mockSurveyData.spec[0]] as Spec[]);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  test('should still call onComplete and onClose even when error occurs', async () => {
    mockDeleteRequest.mockRejectedValueOnce(new Error('fail'));

    const { result } = renderHook(() =>
      useDeleteSurvey({
        onClose: mockOnClose,
        onComplete: mockOnComplete,
        onError: mockOnError,
        id: '1',
        templateType: 'job_template',
      })
    );

    await result.current(mockSurveyData.spec);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
