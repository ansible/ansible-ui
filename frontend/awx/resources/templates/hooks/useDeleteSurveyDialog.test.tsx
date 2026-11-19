import { render, renderHook, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { RequestError } from '@ansible/common-ui/crud/RequestError';
import type { Spec } from '../../../interfaces/Survey';
import { useDeleteSurveyDialog } from './useDeleteSurveyDialog';

const dialogControls = vi.hoisted(() => ({
  setDialog: vi.fn(),
  addAlert: vi.fn(),
}));

const surveyDelete = vi.hoisted(() => ({
  impl: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  PageTable: () => <div>Survey questions</div>,
  usePageDialog: () => [undefined, dialogControls.setDialog],
  usePageAlertToaster: () => ({
    addAlert: dialogControls.addAlert,
  }),
}));

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ id: '123' }),
}));

vi.mock('./useDeleteSurvey', () => ({
  useDeleteSurvey: (props: {
    onError: (error: unknown) => void;
    onComplete: (questions: Spec[]) => void;
    onClose: () => void;
  }) => {
    return (questions: Spec[]) => {
      surveyDelete.impl(props, questions);
    };
  },
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
    surveyDelete.impl.mockImplementation(
      (
        props: { onComplete: (questions: Spec[]) => void; onClose: () => void },
        questions: Spec[]
      ) => {
        props.onComplete(questions);
        props.onClose();
      }
    );
  });

  function openDialog(questions: Spec[] = mockSurveyQuestions, templateType?: 'job_template') {
    const { result } = renderHook(() => useDeleteSurveyDialog(mockOnComplete, templateType), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    result.current(questions);
    const dialog = dialogControls.setDialog.mock.calls[0][0] as React.ReactElement;
    render(<MemoryRouter>{dialog}</MemoryRouter>);
  }

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

  test('confirms deletion and closes the dialog', async () => {
    const user = userEvent.setup();
    openDialog();

    expect(screen.getByRole('dialog', { name: 'Delete survey' })).toBeInTheDocument();
    expect(screen.getByText('Survey questions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm delete' })).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    await user.click(
      screen.getByRole('checkbox', {
        name: /Yes, I confirm that I want to remove these 2 survey questions/,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(mockOnComplete).toHaveBeenCalledWith(mockSurveyQuestions);
    expect(dialogControls.setDialog).toHaveBeenCalledWith(undefined);
  });

  test('cancels without deleting and hides the question list when nothing is selected', async () => {
    const user = userEvent.setup();
    openDialog([]);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(surveyDelete.impl).not.toHaveBeenCalled();
    expect(dialogControls.setDialog).toHaveBeenCalledWith(undefined);
  });

  test('shows generic and field errors when deletion fails', async () => {
    const user = userEvent.setup();
    surveyDelete.impl.mockImplementation((props: { onError: (error: unknown) => void }) => {
      props.onError(new Error('cannot delete'));
      props.onError(
        new RequestError(
          'Bad Request',
          undefined,
          400,
          { name: ['bad name'] },
          { name: ['bad name'] }
        )
      );
    });
    openDialog(mockSurveyQuestions, 'job_template');

    await user.click(
      screen.getByRole('checkbox', {
        name: /Yes, I confirm that I want to remove these 2 survey questions/,
      })
    );
    await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

    expect(dialogControls.addAlert).toHaveBeenCalledTimes(2);
    expect(dialogControls.addAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'danger',
        title: 'Failed to delete survey questions',
      })
    );
  });
});
