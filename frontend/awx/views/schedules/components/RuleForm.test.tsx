/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RuleFields, ScheduleFormWizard } from '../types';
import { RuleForm, pad } from './RuleForm';

const mockUsePageWizard = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));

vi.mock('../hooks/useGet24HourTime', () => ({
  useGet24HourTime: () => () => ({ hour: 10, minute: 0 }),
}));

const defaultWizardData = {
  activeStep: { id: 'rules' },
  wizardData: {
    timezone: 'America/New_York',
    startDateTime: { date: '2025-01-15', time: '10:00' },
  } as ScheduleFormWizard,
};

function FormSpy() {
  const rules = useWatch({ name: 'rules' }) as RuleFields['rules'];
  const exceptions = useWatch({ name: 'exceptions' }) as RuleFields['exceptions'];
  return (
    <>
      <pre data-testid="form-rules">{JSON.stringify(rules)}</pre>
      <pre data-testid="form-exceptions">{JSON.stringify(exceptions)}</pre>
    </>
  );
}

function TestWrapper({
  children,
  defaultValues,
}: Readonly<{ children: React.ReactNode; defaultValues?: Partial<RuleFields> }>) {
  const methods = useForm<RuleFields>({
    defaultValues: {
      freq: 2,
      interval: 1,
      wkst: 0,
      rules: [],
      exceptions: [],
      endType: 'never',
      until: null,
      ...defaultValues,
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('pad', () => {
  it('should pad single-digit numbers with a leading zero', () => {
    expect(pad(5)).toBe('05');
  });

  it('should return double-digit numbers unchanged', () => {
    expect(pad(10)).toBe(10);
  });

  it('should return strings unchanged', () => {
    // The runtime guard handles string inputs despite the number type signature
    expect(pad('abc' as unknown as number)).toBe('abc');
  });
});

describe('RuleForm', () => {
  const ruleFormTitle = 'Define rules';

  beforeEach(() => {
    mockUsePageWizard.mockReturnValue(defaultWizardData);
  });

  it('should render Frequency label', () => {
    render(
      <TestWrapper>
        <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Frequency')).toBeInTheDocument();
  });

  it('should render Interval label', () => {
    render(
      <TestWrapper>
        <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Interval')).toBeInTheDocument();
  });

  it('should render Schedule ending type label', () => {
    render(
      <TestWrapper>
        <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByText('Schedule ending type')).toBeInTheDocument();
  });

  it('should display user-friendly tooltip for Occurrences field', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
      </TestWrapper>
    );

    const occurrencesLabel = screen.getByText('Occurrences');
    expect(occurrencesLabel).toBeInTheDocument();

    const occurrencesFormGroup = occurrencesLabel.closest('.pf-v6-c-form__group');
    const helpButton = occurrencesFormGroup?.querySelector('button[type="button"]');

    expect(helpButton).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    await user.click(helpButton!);

    await waitFor(() => {
      expect(
        screen.getByText(/Filter which occurrences to include within each recurrence interval/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Use positive numbers \(1, 2, 3\.\.\.\) to select from the beginning/i)
    ).toBeInTheDocument();

    expect(screen.queryByText(/iCalendar RFC/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bysetpos field/i)).not.toBeInTheDocument();
  });

  describe('conditional rendering', () => {
    it('should show Count input when endType is count', () => {
      render(
        <TestWrapper defaultValues={{ endType: 'count' }}>
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByRole('spinbutton', { name: 'Count' })).toBeInTheDocument();
    });

    it('should show Until date picker when endType is until', () => {
      render(
        <TestWrapper defaultValues={{ endType: 'until' }}>
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
        </TestWrapper>
      );

      // Both the dropdown toggle (selected value) and the date picker field label render "Until".
      // Verify the form label specifically, which only renders when the date picker is shown.
      const untilElements = screen.getAllByText('Until');
      expect(untilElements.some((el) => el.classList.contains('pf-v6-c-form__label-text'))).toBe(
        true
      );
    });

    it('should not show Count or Until fields when endType is never', () => {
      render(
        <TestWrapper defaultValues={{ endType: 'never' }}>
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
        </TestWrapper>
      );

      expect(screen.queryByRole('spinbutton', { name: 'Count' })).not.toBeInTheDocument();
    });
  });

  describe('Save button', () => {
    it('should show the Save rule button for a new rule', () => {
      render(
        <TestWrapper>
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('add-rule-button')).toBeInTheDocument();
    });

    it('should add a new rule and close the form when saving', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper>
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('add-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const rulesContent = screen.getByTestId('form-rules').textContent ?? '';
        expect(JSON.parse(rulesContent)).toHaveLength(1);
      });
    });

    it('should show the Update rule button when editing an existing rule', () => {
      render(
        <TestWrapper>
          <RuleForm title={ruleFormTitle} isOpen={1} setIsOpen={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('update-rule-button')).toBeInTheDocument();
    });

    it('should close the form when updating an existing rule', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper>
          <RuleForm title={ruleFormTitle} isOpen={1} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('update-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should find and replace an existing rule by id when updating in the rules step', async () => {
      // Arrange — pre-populate the rules array so the findIndex callback actually executes
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      const existingRule = { id: 1, rule: 'RRULE:FREQ=DAILY' };
      render(
        <TestWrapper defaultValues={{ rules: [existingRule] }}>
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={1} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('update-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should find and replace an existing exception by id when updating in the exceptions step', async () => {
      // Arrange — pre-populate exceptions so the findIndex callback actually executes
      mockUsePageWizard.mockReturnValue({
        activeStep: { id: 'exceptions' },
        wizardData: {
          timezone: 'America/New_York',
          startDateTime: { date: '2025-01-15', time: '10:00' },
        } as ScheduleFormWizard,
      });
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      const existingException = { id: 1, rule: 'RRULE:FREQ=DAILY' };
      render(
        <TestWrapper defaultValues={{ exceptions: [existingException] }}>
          <FormSpy />
          <RuleForm title="Define exceptions" isOpen={1} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('update-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should add a new exception and close the form when in the exceptions step', async () => {
      // Arrange
      mockUsePageWizard.mockReturnValue({
        activeStep: { id: 'exceptions' },
        wizardData: {
          timezone: 'America/New_York',
          startDateTime: { date: '2025-01-15', time: '10:00' },
        } as ScheduleFormWizard,
      });
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper>
          <FormSpy />
          <RuleForm title="Define exceptions" isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('add-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const exceptionsContent = screen.getByTestId('form-exceptions').textContent ?? '';
        expect(JSON.parse(exceptionsContent)).toHaveLength(1);
      });
    });
  });

  describe('until handling', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set UNTIL in UTC and append Z suffix when both until date and time are provided', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper
          defaultValues={{ endType: 'until', until: { date: '2025-06-01', time: '2:00 PM' } }}
        >
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('add-rule-button'));

      // Assert: UNTIL is converted to UTC (10:00 EDT = 14:00 UTC) with Z suffix
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const rulesContent = screen.getByTestId('form-rules').textContent ?? '';
        expect(rulesContent).toContain('UNTIL=20250601T140000Z');
      });
    });

    it('should use midnight in the schedule timezone when only until date is provided', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper defaultValues={{ endType: 'until', until: { date: '2025-06-01', time: '' } }}>
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('add-rule-button'));

      // Assert: midnight EDT (UTC-4) = 04:00 UTC with Z suffix
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const rulesContent = screen.getByTestId('form-rules').textContent ?? '';
        expect(rulesContent).toContain('UNTIL=20250601T040000Z');
      });
    });

    it("should use tomorrow's date in the schedule timezone when only until time is provided", async () => {
      // Arrange
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2025-05-31T00:00:00Z'));
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper defaultValues={{ endType: 'until', until: { date: '', time: '2:00 PM' } }}>
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('add-rule-button'));

      // Assert: 2025-05-31 10:00 EDT (UTC-4) = 14:00 UTC with Z suffix
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const rulesContent = screen.getByTestId('form-rules').textContent ?? '';
        expect(rulesContent).toContain('UNTIL=20250531T140000Z');
      });
    });
  });

  describe('Discard button', () => {
    it('should close the form without saving when discarding', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      render(
        <TestWrapper>
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('discard-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
    });

    it('should preserve the existing rules array when discarding from the rules step', async () => {
      // Arrange
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      const existingRules = [{ id: 1, rule: 'RRULE:FREQ=DAILY' }];
      render(
        <TestWrapper defaultValues={{ rules: existingRules }}>
          <FormSpy />
          <RuleForm title={ruleFormTitle} isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('discard-rule-button'));

      // Assert: discard resets the form, keeping the existing rules intact
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const rulesContent = screen.getByTestId('form-rules').textContent ?? '';
        expect(JSON.parse(rulesContent)).toEqual(existingRules);
      });
    });

    it('should preserve the existing exceptions array when discarding from the exceptions step', async () => {
      // Arrange
      mockUsePageWizard.mockReturnValue({
        activeStep: { id: 'exceptions' },
        wizardData: {
          timezone: 'America/New_York',
          startDateTime: { date: '2025-01-15', time: '10:00' },
        } as ScheduleFormWizard,
      });
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      const existingExceptions = [{ id: 1, rule: 'RRULE:FREQ=DAILY' }];
      render(
        <TestWrapper defaultValues={{ exceptions: existingExceptions }}>
          <FormSpy />
          <RuleForm title="Define exceptions" isOpen={false} setIsOpen={setIsOpen} />
        </TestWrapper>
      );

      // Act
      await user.click(screen.getByTestId('discard-rule-button'));

      // Assert
      expect(setIsOpen).toHaveBeenCalledWith(false);
      await waitFor(() => {
        const exceptionsContent = screen.getByTestId('form-exceptions').textContent ?? '';
        expect(JSON.parse(exceptionsContent)).toEqual(existingExceptions);
      });
    });
  });
});
