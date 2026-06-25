/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useDeleteTemplates } from './useDeleteTemplates';
import { useCopyTemplate } from './useCopyTemplate';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { JobTemplate } from '../../../interfaces/JobTemplate';
import { WorkflowJobTemplate } from '../../../interfaces/WorkflowJobTemplate';

vi.mock('../../../common/useAwxBulkConfirmation');
vi.mock('@ansible/common-ui/crud/Data');
vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));
const mockAddAlert = vi.fn();
const mockReplaceAlert = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    usePageAlertToaster: vi.fn(() => ({
      addAlert: mockAddAlert,
      replaceAlert: mockReplaceAlert,
    })),
  };
});
vi.mock('./useTemplateColumns', () => ({
  useTemplateColumns: vi.fn(() => []),
}));
vi.mock('@ansible/common-ui/columns', () => ({
  useNameColumn: vi.fn(() => ({ header: 'Name' })),
}));

function createMockJobTemplate(overrides: Partial<JobTemplate> = {}): JobTemplate {
  return {
    id: 1,
    name: 'Job Template A',
    type: 'job_template',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, schedule: true, copy: true },
    },
    ...overrides,
  } as JobTemplate;
}

function createMockWorkflowTemplate(
  overrides: Partial<WorkflowJobTemplate> = {}
): WorkflowJobTemplate {
  return {
    id: 2,
    name: 'Workflow Template A',
    type: 'workflow_job_template',
    summary_fields: {
      user_capabilities: { edit: true, delete: true, start: true, schedule: true, copy: true },
    },
    ...overrides,
  } as WorkflowJobTemplate;
}

describe('useDeleteTemplates', () => {
  const mockBulkAction = vi.fn();
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAwxBulkConfirmation).mockReturnValue(mockBulkAction);
  });

  test('should return a delete function', () => {
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should use singular title for single job_template', () => {
    const templates = [createMockJobTemplate()];
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current(templates);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete job template/i);
  });

  test('should use singular title for single workflow_job_template', () => {
    const templates = [createMockWorkflowTemplate()];
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current(templates);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete workflow job template/i);
  });

  test('should use plural title for multiple templates', () => {
    const templates = [createMockJobTemplate(), createMockWorkflowTemplate()];
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current(templates);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.title).toMatch(/permanently delete templates/i);
  });

  test('should mark as danger', () => {
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current([createMockJobTemplate()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.isDanger).toBe(true);
  });

  test('should pass onComplete callback', () => {
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current([createMockJobTemplate()]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.onComplete).toBe(mockOnComplete);
  });

  test('should call requestDelete for job_template with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current([createMockJobTemplate({ id: 10 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockJobTemplate({ id: 10 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/job_templates/10/'),
      signal
    );
  });

  test('should call requestDelete for workflow_job_template with correct URL', async () => {
    const { requestDelete } = await import('@ansible/common-ui/crud/Data');
    vi.mocked(requestDelete).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current([createMockWorkflowTemplate({ id: 20 })]);

    const callArgs = mockBulkAction.mock.calls[0][0];
    const signal = new AbortController().signal;
    await callArgs.actionFn(createMockWorkflowTemplate({ id: 20 }), signal);

    expect(requestDelete).toHaveBeenCalledWith(
      expect.stringContaining('/workflow_job_templates/20/'),
      signal
    );
  });

  test('should sort templates by name', () => {
    const templates = [
      createMockJobTemplate({ id: 1, name: 'Zulu' }),
      createMockWorkflowTemplate({ id: 2, name: 'Alpha' }),
    ];
    const { result } = renderHook(() => useDeleteTemplates(mockOnComplete));

    result.current(templates);

    const callArgs = mockBulkAction.mock.calls[0][0];
    expect(callArgs.items[0].name).toBe('Alpha');
    expect(callArgs.items[1].name).toBe('Zulu');
  });
});

describe('useCopyTemplate', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return a copy function', () => {
    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    expect(typeof result.current).toBe('function');
  });

  test('should post to job_templates copy endpoint for job_template', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockJobTemplate({ id: 5, name: 'My JT' }));

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/job_templates/5/copy/'),
      expect.objectContaining({ name: expect.stringContaining('My JT') })
    );
  });

  test('should post to workflow_job_templates copy endpoint for workflow', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockWorkflowTemplate({ id: 8, name: 'My WF' }));

    expect(mockPostRequest).toHaveBeenCalledWith(
      expect.stringContaining('/workflow_job_templates/8/copy/'),
      expect.objectContaining({ name: expect.stringContaining('My WF') })
    );
  });

  test('should add success alert on successful copy', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockJobTemplate({ id: 1, name: 'Tmpl' }));

    await vi.waitFor(() => {
      expect(mockAddAlert).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' }));
    });
  });

  test('should replace alert with danger on failed copy', async () => {
    const mockPostRequest = vi.fn().mockRejectedValue(new Error('Copy failed'));
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockJobTemplate({ id: 1, name: 'Tmpl' }));

    await vi.waitFor(() => {
      expect(mockReplaceAlert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ variant: 'danger' })
      );
    });
  });

  test('should call onComplete after successful copy', async () => {
    const mockPostRequest = vi.fn().mockResolvedValue(undefined);
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockJobTemplate({ id: 1, name: 'Tmpl' }));

    await vi.waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  test('should call onComplete after failed copy', async () => {
    const mockPostRequest = vi.fn().mockRejectedValue(new Error('fail'));
    const { usePostRequest } = await import('@ansible/common-ui/crud/usePostRequest');
    vi.mocked(usePostRequest).mockReturnValue(mockPostRequest);

    const { result } = renderHook(() => useCopyTemplate(mockOnComplete));

    result.current(createMockJobTemplate({ id: 1, name: 'Tmpl' }));

    await vi.waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });
});
