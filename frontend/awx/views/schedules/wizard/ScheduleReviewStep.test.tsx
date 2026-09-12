import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PromptFormValues } from '../../../resources/templates/WorkflowVisualizer/types';
import type { ScheduleFormWizard } from '../types';
import { ScheduleReviewStep } from './ScheduleReviewStep';

type WizardDataMock = Partial<Omit<ScheduleFormWizard, 'prompt' | 'resource'>> & {
  prompt?: Partial<PromptFormValues>;
  resource?: Record<string, unknown>;
};

const mocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  getPageUrl: vi.fn(
    (route: string, options?: { params: Record<string, unknown> }) =>
      `${route}/${JSON.stringify(options?.params ?? {})}`
  ),
  setWizardData: vi.fn(),
  useWatch: vi.fn(),
  wizard: {
    wizardData: {
      schedule_type: 'job',
      resourceId: 42,
      resource: { id: 42 },
      schedule_days_to_keep: 7,
      name: 'Nightly schedule',
      description: 'Runs at night',
      startDateTime: { date: '2025-01-01', time: '01:00' },
      timezone: 'UTC',
      exceptions: [{ id: 2, rule: 'EXRULE:FREQ=DAILY' }],
      rules: [{ id: 1, rule: 'RRULE:FREQ=DAILY' }],
      prompt: { labels: [{ id: 1, name: 'wizard label' }] },
    },
    stepData: { details: { prompt: { labels: [{ id: 2, name: 'details label' }] } } },
    visibleSteps: [] as { id: string }[],
    setWizardData: vi.fn(),
  } as {
    wizardData: WizardDataMock;
    stepData: { details?: { prompt?: Partial<PromptFormValues> } };
    visibleSteps: { id: string }[];
    setWizardData: ReturnType<typeof vi.fn>;
  },
}));

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageDetail: ({ label, children }: Readonly<{ label: string; children?: React.ReactNode }>) => (
    <div>
      <span>{label}</span>
      {children}
    </div>
  ),
  PageDetails: ({ children }: Readonly<{ children?: React.ReactNode }>) => <div>{children}</div>,
  useGetPageUrl: () => mocks.getPageUrl,
}));
vi.mock('@ansible/ansible-ui-framework/components/LoadingState', () => ({
  LoadingState: () => <div>Loading</div>,
}));
vi.mock('@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection', () => ({
  PageFormSection: ({
    title,
    children,
  }: Readonly<{ title: string; children?: React.ReactNode }>) => (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  ),
}));
vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => mocks.wizard,
}));
vi.mock('@ansible/common-ui/crud/useGet', () => ({
  useGetItem: mocks.getItem,
}));
vi.mock('@patternfly/react-core', () => ({
  Label: ({ children }: Readonly<{ children?: React.ReactNode }>) => <span>{children}</span>,
  LabelGroup: ({ children }: Readonly<{ children?: React.ReactNode }>) => <div>{children}</div>,
}));
vi.mock('react-hook-form', () => ({
  useFormContext: () => ({ control: {} }),
  useWatch: mocks.useWatch,
}));
vi.mock('react-router-dom', () => ({
  Link: ({ to, children }: Readonly<{ to: string; children?: React.ReactNode }>) => (
    <a href={to}>{children}</a>
  ),
}));
vi.mock('../../../common/AwxError', () => ({
  AwxError: ({ error }: Readonly<{ error: unknown }>) => <div>Error: {String(error)}</div>,
}));
vi.mock('../../../resources/templates/WorkflowVisualizer/wizard/helpers', () => ({
  getResourceURL: (type: string) => `/api/${type}`,
}));
vi.mock('../../../resources/templates/WorkflowVisualizer/wizard/PromptReviewDetails', () => ({
  PromptReviewDetails: ({ labels }: Readonly<{ labels?: { name: string }[] }>) => (
    <div>Prompt details: {labels?.map((label) => label.name).join(',')}</div>
  ),
}));
vi.mock('../components/RulesList', () => ({
  RulesList: ({ ruleType }: Readonly<{ ruleType: string }>) => <div>{ruleType} list</div>,
}));
vi.mock('../SchedulePage/TimezoneToggle', () => ({
  TimezoneToggle: ({ isLocal }: Readonly<{ isLocal: boolean }>) => (
    <button>{String(isLocal)}</button>
  ),
}));

function setResource(resource: Record<string, unknown>, error?: unknown) {
  mocks.getItem.mockReturnValue({ data: resource, isLoading: false, error });
}

describe('ScheduleReviewStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useWatch.mockReturnValue(undefined);
    mocks.wizard.wizardData = {
      schedule_type: 'job',
      resourceId: 42,
      resource: { id: 42 },
      schedule_days_to_keep: 7,
      name: 'Nightly schedule',
      description: 'Runs at night',
      startDateTime: { date: '2025-01-01', time: '01:00' },
      timezone: 'UTC',
      exceptions: [{ id: 2, rule: 'EXRULE:FREQ=DAILY' }],
      rules: [{ id: 1, rule: 'RRULE:FREQ=DAILY' }],
      prompt: { labels: [{ id: 1, name: 'wizard label' }] },
    } as never;
    mocks.wizard.stepData = { details: { prompt: { labels: [{ id: 2, name: 'details label' }] } } };
    mocks.wizard.visibleSteps = [];
    setResource({ id: 42, name: 'Job template', scm_branch: 'main' });
    mocks.setWizardData.mockImplementation((update: (previous: object) => object) => update({}));
    mocks.wizard.setWizardData = mocks.setWizardData;
  });

  it('renders loading and error states', () => {
    mocks.getItem.mockReturnValueOnce({ data: undefined, isLoading: true, error: undefined });
    const { rerender } = render(<ScheduleReviewStep />);
    expect(screen.getByText('Loading')).toBeInTheDocument();

    setResource({ id: 42 }, 'request failed');
    rerender(<ScheduleReviewStep />);
    expect(screen.getByText('Error: request failed')).toBeInTheDocument();
  });

  it('renders the review without prompt details', () => {
    mocks.useWatch.mockReturnValue([{ id: 3, name: 'form label' }]);
    render(<ScheduleReviewStep />);
    expect(screen.getByText('Review')).toBeInTheDocument();
    expect(screen.getByText('Job Template')).toBeInTheDocument();
    expect(screen.getByText('Job template')).toBeInTheDocument();
    expect(screen.getByText('2025-01-01, 01:00')).toBeInTheDocument();
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('wizard label')).toBeInTheDocument();
    expect(screen.getByText('rules list')).toBeInTheDocument();
    expect(screen.getByText('exceptions list')).toBeInTheDocument();
    expect(mocks.setWizardData).toHaveBeenCalled();
  });

  it('skips label synchronization when no labels are available', () => {
    mocks.wizard.wizardData = { ...mocks.wizard.wizardData, prompt: {} } as never;
    mocks.wizard.stepData = { details: {} };
    render(<ScheduleReviewStep />);
    expect(screen.getByText('Job template')).toBeInTheDocument();
  });

  it('handles empty resources and optional review fields', () => {
    mocks.getItem.mockReturnValue({ data: undefined, isLoading: false, error: undefined });
    mocks.wizard.wizardData = {
      ...mocks.wizard.wizardData,
      schedule_type: 'workflow_job_template',
      startDateTime: undefined,
      exceptions: [],
      prompt: {},
    } as never;
    mocks.wizard.visibleSteps = [{ id: 'not-a-prompt-step' }, { id: 'survey' }];
    render(<ScheduleReviewStep />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders prompt details and the inventory source link', () => {
    mocks.wizard.wizardData = {
      ...mocks.wizard.wizardData,
      schedule_type: 'inventory_update',
      prompt: { labels: [] },
    } as never;
    mocks.wizard.visibleSteps = [{ id: 'promptStep' }];
    mocks.wizard.stepData = { details: { prompt: { labels: [{ id: 2, name: 'details label' }] } } };
    mocks.useWatch.mockReturnValue(null);
    setResource({
      id: 8,
      name: 'Inventory source',
      type: 'inventory_source',
      inventory: 9,
      summary_fields: { inventory: { kind: 'constructed' } },
    });
    render(<ScheduleReviewStep />);
    expect(screen.getByText('Prompt details: details label')).toBeInTheDocument();
    expect(screen.getByText('Inventory source')).toBeInTheDocument();
    expect(mocks.getPageUrl).toHaveBeenCalledWith(expect.anything(), {
      params: { source_id: 8, id: 9, inventory_type: 'constructed' },
    });
  });
});
