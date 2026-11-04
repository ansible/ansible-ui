import { ColumnTableOption, ITableColumn } from '@ansible/ansible-ui-framework';
import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { render, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { UnifiedJob } from '../interfaces/UnifiedJob';
import {
  useJobDurationColumn,
  useJobExecutionEnvColumn,
  useJobExplanationColumn,
  useJobFinishedColumn,
  useJobIdColumn,
  useJobLaunchedByColumn,
  useJobScheduleColumn,
  useJobScehduleColumn,
  useJobSliceColumn,
  useJobSliceParentColumn,
  useJobSourceColumn,
  useJobStartedColumn,
  useJobStatusColumn,
  useJobTemplateColumn,
  useJobTypeColumn,
  useJobWorkflowColumn,
  useSourceWorkflowColumn,
} from './JobColumns';
import { awxAPI } from './api/awx-utils';

vi.mock('@ansible/ansible-ui-framework/PageNavigation/useGetPageUrl', () => ({
  useGetPageUrl: () => (route: string, options?: { params?: Record<string, unknown> }) => {
    const params = options?.params ?? {};
    const paramStr = Object.entries(params)
      .map(([k, v]) => `${k}=${String(v)}`)
      .join('&');
    return `/${route}?${paramStr}`;
  },
}));

const server = setupServer(
  http.options(awxAPI`/inventory_sources/`, () =>
    HttpResponse.json({
      actions: {
        GET: {
          source: {
            choices: [
              ['aws', 'Amazon Web Services'],
              ['gce', 'Google Compute Engine'],
            ],
          },
        },
      },
    })
  )
);

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SwrTestWrapper>
      <MemoryRouter>{children}</MemoryRouter>
    </SwrTestWrapper>
  );
}

function renderCell(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}

function columnCellNode(column: ITableColumn<UnifiedJob>, job: UnifiedJob): React.ReactNode {
  if (!('cell' in column) || typeof column.cell !== 'function') {
    throw new Error('Expected column cell to be a function');
  }
  return column.cell(job);
}

function columnValue(column: ITableColumn<UnifiedJob>, job: UnifiedJob): unknown {
  if (!('value' in column) || typeof column.value !== 'function') {
    return undefined;
  }
  return column.value(job);
}

function testJob(overrides: unknown = {}): UnifiedJob {
  return {
    id: 42,
    status: 'successful',
    type: 'job',
    job_type: 'run',
    started: '2025-01-01T10:00:00.000000Z',
    finished: '2025-01-01T10:05:00.000000Z',
    source: 'ec2',
    launch_type: 'manual',
    summary_fields: {},
    ...(overrides as Partial<UnifiedJob>),
  } as UnifiedJob;
}

function baseJob(overrides: unknown = {}): UnifiedJob {
  return testJob(overrides);
}

describe('JobColumns hooks', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('useJobIdColumn renders job id', () => {
    const { result } = renderHook(() => useJobIdColumn(), { wrapper });
    const job = baseJob();
    expect(columnCellNode(result.current, job)).toBe(42);
    expect(result.current.sort).toBe('id');
  });

  test('useJobStatusColumn renders status cell', () => {
    const { result } = renderHook(() => useJobStatusColumn(), { wrapper });
    const { container } = renderCell(columnCellNode(result.current, baseJob()));
    expect(container.textContent).toBeTruthy();
  });

  test('useJobTypeColumn maps job types', () => {
    const { result } = renderHook(() => useJobTypeColumn(), { wrapper });
    const types: Array<[Partial<UnifiedJob>, string]> = [
      [{ type: 'project_update' }, 'Source control update'],
      [{ type: 'inventory_update' }, 'Inventory sync'],
      [{ type: 'job', job_type: 'check' }, 'Playbook check'],
      [{ type: 'job', job_type: 'run' }, 'Playbook run'],
      [{ type: 'ad_hoc_command' }, 'Command'],
      [{ type: 'system_job' }, 'Management job'],
      [{ type: 'workflow_job' }, 'Workflow job'],
    ];
    for (const [overrides] of types) {
      const { container } = renderCell(columnCellNode(result.current, baseJob(overrides)));
      expect(container.textContent).toBeTruthy();
    }
  });

  test('useJobDurationColumn renders elapsed time when started', () => {
    const { result } = renderHook(() => useJobDurationColumn(), { wrapper });
    const { container } = renderCell(columnCellNode(result.current, baseJob()));
    expect(container.textContent).toBeTruthy();
    expect(columnCellNode(result.current, baseJob({ started: undefined }))).toBeFalsy();
  });

  test('useJobStartedColumn and useJobFinishedColumn render date cells', () => {
    const started = renderHook(() => useJobStartedColumn(), { wrapper });
    const finished = renderHook(() => useJobFinishedColumn(), { wrapper });
    expect(
      renderCell(columnCellNode(started.result.current, baseJob())).container.textContent
    ).toBeTruthy();
    expect(
      renderCell(columnCellNode(finished.result.current, baseJob())).container.textContent
    ).toBeTruthy();
    expect(finished.result.current.defaultSort).toBe(true);
  });

  test('useJobSourceColumn maps inventory source label', async () => {
    const { result } = renderHook(() => useJobSourceColumn(), { wrapper });
    await vi.waitFor(() => {
      expect(columnCellNode(result.current, baseJob({ source: 'ec2' }))).toBeTruthy();
    });
    expect(columnValue(result.current, baseJob({ source: 'ec2' }))).toBe(true);
  });

  test('useJobScheduleColumn links to schedule when present', () => {
    const job = baseJob({
      summary_fields: {
        unified_job_template: { id: 10 },
        schedule: { id: 5, name: 'Nightly' },
      },
    });
    const { result } = renderHook(() => useJobScheduleColumn(ColumnTableOption.expanded), {
      wrapper,
    });
    const { getByRole } = renderCell(columnCellNode(result.current, job));
    expect(getByRole('link', { name: 'Nightly' })).toBeInTheDocument();
  });

  test('useJobScehduleColumn handles scheduled and deleted schedules', () => {
    const { result } = renderHook(() => useJobScehduleColumn(), { wrapper });
    const scheduled = baseJob({
      launch_type: 'scheduled',
      summary_fields: {
        unified_job_template: { id: 1 },
        schedule: { id: 2, name: 'Weekly' },
      },
    });
    expect(
      renderCell(columnCellNode(result.current, scheduled)).getByRole('link')
    ).toHaveTextContent('Weekly');

    const deletedSchedule = baseJob({
      launch_type: 'scheduled',
      summary_fields: { unified_job_template: { id: 1 } },
    });
    expect(
      renderCell(columnCellNode(result.current, deletedSchedule)).container.textContent
    ).toContain('Deleted');

    const manual = baseJob({ launch_type: 'manual' });
    expect(columnCellNode(result.current, manual)).toBe('Unavailable');
  });

  test('useJobWorkflowColumn and useJobTemplateColumn render template links', () => {
    const workflow = renderHook(() => useJobWorkflowColumn(), { wrapper });
    const template = renderHook(() => useJobTemplateColumn(), { wrapper });
    const job = baseJob({
      summary_fields: {
        workflow_job_template: { id: 3, name: 'WF Template' },
        job_template: { id: 4, name: 'Job Template' },
      },
    });
    expect(
      renderCell(columnCellNode(workflow.result.current, job)).getByRole('link', {
        name: 'WF Template',
      })
    ).toBeInTheDocument();
    expect(
      renderCell(columnCellNode(template.result.current, job)).getByRole('link', {
        name: 'Job Template',
      })
    ).toBeInTheDocument();
  });

  test('useSourceWorkflowColumn renders source workflow link', () => {
    const { result } = renderHook(() => useSourceWorkflowColumn(), { wrapper });
    const job = baseJob({
      summary_fields: { source_workflow_job: { id: 9, name: 'Parent WF' } },
    });
    expect(
      renderCell(columnCellNode(result.current, job)).getByRole('link', { name: 'Parent WF' })
    ).toBeInTheDocument();
  });

  test('useJobExplanationColumn exposes explanation text', () => {
    const { result } = renderHook(() => useJobExplanationColumn(), { wrapper });
    const job = baseJob({ job_explanation: 'Failed on host' });
    expect(columnCellNode(result.current, job)).toBe('Failed on host');
    expect(columnValue(result.current, job)).toBe('Failed on host');
  });

  test('useJobSliceParentColumn value detects sliced workflow jobs', () => {
    const { result } = renderHook(() => useJobSliceParentColumn(), { wrapper });
    const job = baseJob({ type: 'workflow_job', is_sliced_job: true });
    expect(columnValue(result.current, job)).toBe(true);
    expect(renderCell(columnCellNode(result.current, job)).container.textContent).toContain('True');
  });

  test('useJobSliceColumn renders slice numbers', () => {
    const { result } = renderHook(() => useJobSliceColumn(), { wrapper });
    const job = baseJob({ job_slice_number: 2, job_slice_count: 5 });
    expect(renderCell(columnCellNode(result.current, job)).container.textContent).toContain('2/5');
  });

  test('useJobLaunchedByColumn renders link when launched by details include link', () => {
    const { result } = renderHook(() => useJobLaunchedByColumn(), { wrapper });
    const job = baseJob({
      launch_type: 'webhook',
      summary_fields: {
        created_by: { id: 1, username: 'admin' },
        job_template: { id: 7 },
      },
    });
    const { getByRole } = renderCell(columnCellNode(result.current, job));
    expect(getByRole('link', { name: 'Webhook' })).toBeInTheDocument();
  });

  test('useJobExecutionEnvColumn value respects job state', () => {
    const { result } = renderHook(() => useJobExecutionEnvColumn(), { wrapper });
    const running = baseJob({
      status: 'running',
      summary_fields: { execution_environment: { id: 1, name: 'ee' } },
    });
    expect(columnValue(result.current, running)).toBe(false);

    const successful = baseJob({
      status: 'successful',
      summary_fields: { execution_environment: { id: 1, name: 'ee' } },
    });
    expect(columnValue(result.current, successful)).toBe(true);
    expect(
      renderCell(columnCellNode(result.current, successful)).getByRole('link', { name: 'ee' })
    ).toBeInTheDocument();
  });
});
