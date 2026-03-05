import { render, screen } from '@testing-library/react';
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
});
