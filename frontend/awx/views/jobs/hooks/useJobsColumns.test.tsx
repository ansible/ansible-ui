import { ITableColumn } from '@ansible/ansible-ui-framework';
import { SwrTestWrapper } from '@ansible/ansible-ui-framework/test-utils/swrTestWrapper';
import { render, renderHook, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { UnifiedJob } from '../../../interfaces/UnifiedJob';
import { useJobsColumns } from './useJobsColumns';

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
            choices: [['aws', 'Amazon Web Services']],
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

function testJob(overrides: unknown = {}): UnifiedJob {
  return {
    id: 42,
    name: 'Test job',
    status: 'successful',
    type: 'job',
    job_type: 'run',
    started: '2025-01-01T10:00:00.000000Z',
    finished: '2025-01-01T10:05:00.000000Z',
    launch_type: 'manual',
    summary_fields: {},
    ...(overrides as Partial<UnifiedJob>),
  } as UnifiedJob;
}

function credentialsColumn(columns: ITableColumn<UnifiedJob>[]) {
  const column = columns.find((c) => c.header === 'Credentials');
  if (!column) {
    throw new Error('Credentials column not found');
  }
  return column;
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

describe('useJobsColumns credentials', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('uses summary_fields.credentials when present', () => {
    const { result } = renderHook(() => useJobsColumns(), { wrapper });
    const column = credentialsColumn(result.current);
    const job = testJob({
      summary_fields: {
        credentials: [
          { id: 1, name: 'Machine Cred', description: '', kind: 'ssh', cloud: false, kubernetes: false },
          { id: 2, name: 'Vault Cred', description: '', kind: 'vault', cloud: false, kubernetes: false },
        ],
      },
    });

    expect(columnValue(column, job)).toBe(2);
    render(<MemoryRouter>{columnCellNode(column, job)}</MemoryRouter>);
    expect(screen.getByText(/Machine Cred/)).toBeInTheDocument();
    expect(screen.getByText(/Vault Cred/)).toBeInTheDocument();
  });

  test('falls back to singular summary_fields.credential for ad hoc jobs', () => {
    const { result } = renderHook(() => useJobsColumns(), { wrapper });
    const column = credentialsColumn(result.current);
    const job = testJob({
      type: 'ad_hoc_command',
      summary_fields: {
        credential: {
          id: 9,
          name: 'Ad Hoc Cred',
          description: '',
          kind: 'ssh',
          cloud: false,
          kubernetes: false,
        },
      },
    });

    expect(columnValue(column, job)).toBe(1);
    render(<MemoryRouter>{columnCellNode(column, job)}</MemoryRouter>);
    expect(screen.getByText(/Ad Hoc Cred/)).toBeInTheDocument();
  });

  test('returns no credential value when neither field is set', () => {
    const { result } = renderHook(() => useJobsColumns(), { wrapper });
    const column = credentialsColumn(result.current);
    const job = testJob({ summary_fields: {} });

    expect(columnValue(column, job)).toBeUndefined();
  });
});
