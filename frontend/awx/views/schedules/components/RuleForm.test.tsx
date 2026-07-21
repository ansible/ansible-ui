/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { RuleFields, ScheduleFormWizard } from '../types';
import { RuleForm } from './RuleForm';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    activeStep: { id: 'rules' },
    wizardData: {
      timezone: 'America/New_York',
      startDateTime: { date: '2025-01-15', time: '10:00' },
    } as ScheduleFormWizard,
  }),
}));

vi.mock('../hooks/useGet24HourTime', () => ({
  useGet24HourTime: () => () => ({ hour: 10, minute: 0 }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<RuleFields>({
    defaultValues: {
      freq: 2,
      interval: 1,
      wkst: 0,
      rules: [],
      exceptions: [],
      endType: 'never',
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('RuleForm', () => {
  const ruleFormTitle = 'Define rules';

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

    // Find the Occurrences label
    const occurrencesLabel = screen.getByText('Occurrences');
    expect(occurrencesLabel).toBeInTheDocument();

    // Find the help button that's near the Occurrences label
    // In the DOM, the help button is rendered after the label within the same form group
    const occurrencesFormGroup = occurrencesLabel.closest('.pf-v6-c-form__group');
    const helpButton = occurrencesFormGroup?.querySelector('button[type="button"]');

    expect(helpButton).toBeInTheDocument();

    // Click the help icon to open the popover
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    await user.click(helpButton!);

    // Wait for popover to appear and verify new user-friendly text is present
    await waitFor(() => {
      expect(
        screen.getByText(/Filter which occurrences to include within each recurrence interval/i)
      ).toBeInTheDocument();
    });

    // Verify it explains positive and negative numbers
    expect(
      screen.getByText(/Use positive numbers \(1, 2, 3\.\.\.\) to select from the beginning/i)
    ).toBeInTheDocument();

    // Verify the old confusing text is NOT present
    expect(screen.queryByText(/iCalendar RFC/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bysetpos field/i)).not.toBeInTheDocument();
  });
});
