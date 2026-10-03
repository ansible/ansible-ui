import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScheduleReviewStep } from './ScheduleReviewStep';

const mockUsePageWizard = vi.hoisted(() => vi.fn());
const mockUseGetItem = vi.hoisted(() => vi.fn());

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({ useGetItem: mockUseGetItem }));
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return { ...actual, useGetPageUrl: () => () => '/' };
});
vi.mock('../components/RulesList', () => ({
  RulesList: ({ ruleType }: Readonly<{ ruleType: string }>) => <div>{ruleType}</div>,
}));
vi.mock('../SchedulePage/TimezoneToggle', () => ({
  TimezoneToggle: () => <button type="button">Toggle timezone</button>,
}));
vi.mock('../../../resources/templates/WorkflowVisualizer/wizard/PromptReviewDetails', () => ({
  PromptReviewDetails: () => <div>Prompt details</div>,
}));

const resource = {
  id: 12,
  name: 'Job template',
  type: 'job_template',
  scm_branch: 'main',
  organization: 1,
  summary_fields: {},
};

beforeEach(() => {
  mockUsePageWizard.mockReturnValue({
    wizardData: {
      schedule_type: 'job_template',
      resourceId: 12,
      resource,
      name: 'Nightly',
      description: 'Run nightly',
      startDateTime: { date: '2030-01-01', time: '00:00:00' },
      timezone: 'UTC',
      schedule_days_to_keep: 7,
      exceptions: [],
      rules: [{ id: 1, rule: 'FREQ=DAILY' }],
      prompt: { labels: [{ id: 1, name: 'production' }] },
    },
    visibleSteps: [],
    setWizardData: vi.fn(),
  });
  mockUseGetItem.mockReturnValue({ data: resource, isLoading: false, error: undefined });
});

describe('ScheduleReviewStep', () => {
  it('renders a loading state while the resource is loading', () => {
    mockUseGetItem.mockReturnValueOnce({ data: undefined, isLoading: true, error: undefined });
    render(
      <MemoryRouter>
        <ScheduleReviewStep />
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a resource error', () => {
    mockUseGetItem.mockReturnValueOnce({
      data: resource,
      isLoading: false,
      error: new Error('Unable to load resource'),
    });
    render(
      <MemoryRouter>
        <ScheduleReviewStep />
      </MemoryRouter>
    );
    expect(screen.getByText('Unable to load resource')).toBeInTheDocument();
  });

  it('renders schedule labels when prompt details are unavailable', () => {
    render(
      <MemoryRouter>
        <ScheduleReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('rules')).toBeInTheDocument();
  });

  it('renders prompt details when the prompt step is visible', () => {
    mockUsePageWizard.mockReturnValueOnce({
      wizardData: {
        schedule_type: 'job_template',
        resourceId: 12,
        resource,
        name: 'Nightly',
        description: 'Run nightly',
        startDateTime: { date: '2030-01-01', time: '00:00:00' },
        timezone: 'UTC',
        schedule_days_to_keep: 7,
        exceptions: [],
        rules: [{ id: 1, rule: 'FREQ=DAILY' }],
        prompt: { labels: [{ id: 1, name: 'production' }] },
      },
      visibleSteps: [{ id: 'promptStep' }],
      setWizardData: vi.fn(),
    });

    render(
      <MemoryRouter>
        <ScheduleReviewStep />
      </MemoryRouter>
    );

    expect(screen.getByText('Prompt details')).toBeInTheDocument();
  });
});
