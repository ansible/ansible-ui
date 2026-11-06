<<<<<<< HEAD
import { describe, expect, it, vi } from 'vitest';
import { buildInventorySourceStatusCellProps } from './useInventorySourceColumns';

vi.mock('../inventorySources/InventorySourceDetails', () => ({
  LastJobTooltip: ({ job }: { job: { id?: number } }) => <div>{job.id}</div>,
}));

const mockGetPageUrl = (route: string, config: { params: Record<string, string | number> }) =>
  `/jobs/${config.params.id}`;

type TestInventorySource = {
  status?: string;
  summary_fields?: {
    current_job?: { id?: number; status?: string; finished?: string };
    last_job?: { id?: number; status?: string; finished?: string };
    current_update?: { id?: number };
  };
  related?: { schedules?: string; last_job?: string };
};

function createTestSource(overrides: TestInventorySource = {}): TestInventorySource {
  return {
    status: 'successful',
    summary_fields: {},
    related: { schedules: '/' },
    ...overrides,
  };
}

describe('buildInventorySourceStatusCellProps', () => {
  it('uses current_job id when available', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 100 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('100');
  });

  it('falls back to last_job when current_job empty', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: { id: 200 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('200');
  });

  it('falls back to current_update when current_job and last_job empty', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: {}, current_update: { id: 300 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('300');
  });

  it('falls back to related.last_job URL when no summary fields', () => {
    const source = createTestSource({
      summary_fields: { current_job: {}, last_job: {}, current_update: {} },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/400/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('400');
  });

  it('returns undefined to when no job available', () => {
    const source = createTestSource({
      summary_fields: {},
      related: { schedules: '/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toBeUndefined();
  });

  it('respects disableLinks option', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 500 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl, true);
    expect(props.to).toBeUndefined();
    expect(props.disableLinks).toBe(true);
  });

  it('sets tooltip when job has id and status', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: { id: 600, status: 'successful' },
      },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeDefined();
  });

  it('sets tooltip when job has id, status, and optional finished', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: { id: 600, status: 'successful', finished: '2024-01-01T00:00:00Z' },
      },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeDefined();
  });

  it('has no tooltip when job missing id or status', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: { finished: '2024-01-01T00:00:00Z' },
      },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeUndefined();
  });

  it('has no tooltip when lastJob missing required fields even if jobId available', () => {
    const source = createTestSource({
      summary_fields: {
        last_job: {},
        current_job: {},
        current_update: { id: 300 },
      },
      related: { schedules: '/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeUndefined();
  });

  it('has no tooltip when no job available', () => {
    const source = createTestSource({
      summary_fields: {},
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltip).toBeUndefined();
  });

  it('prefers current_job over all fallbacks', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: { id: 800 },
        last_job: { id: 801 },
        current_update: { id: 802 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/803/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('800');
  });

  it('prefers last_job over current_update and URL', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: {},
        last_job: { id: 900 },
        current_update: { id: 901 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/902/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('900');
  });

  it('prefers current_update over URL', () => {
    const source = createTestSource({
      summary_fields: {
        current_job: {},
        last_job: {},
        current_update: { id: 1000 },
      },
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/1001/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('1000');
  });

  it('includes status from inventory source', () => {
    const source = createTestSource({
      status: 'error',
      summary_fields: { current_job: { id: 100 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.status).toBe('error');
  });

  it('handles null/undefined summary_fields', () => {
    const source = createTestSource({
      summary_fields: undefined,
      related: { schedules: '/', last_job: '/api/v2/inventory_updates/500/' },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('500');
  });

  it('handles null/undefined related', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 600 } },
      related: undefined,
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.to).toContain('600');
  });

  it('sets tooltipId from lastJob', () => {
    const source = createTestSource({
      summary_fields: { current_job: { id: 700 } },
    });
    const props = buildInventorySourceStatusCellProps(source, mockGetPageUrl);
    expect(props.tooltipId).toBe(700);
=======
/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { InventorySource } from '../../../interfaces/InventorySource';
import { useInventorySourceColumns } from './useInventorySourceColumns';

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    useGetPageUrl:
      () =>
      (_routeId: string, opts?: { params?: Record<string, string | number | undefined> }) => {
        const id = opts?.params?.id;
        const jobType = opts?.params?.job_type;
        if (id !== undefined) return `/jobs/${jobType}/${id}/output`;
        return '/mock-url';
      },
  };
});

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: () => ({ data: undefined, error: undefined, isLoading: false }),
}));

function makeInventorySource(overrides: Partial<InventorySource> = {}): InventorySource {
  return {
    id: 1,
    name: 'Test Source',
    description: '',
    source: 'scm',
    scm_branch: '',
    inventory: 10,
    type: 'inventory_source',
    status: 'successful',
    summary_fields: {
      created_by: { id: 1, username: 'admin' },
      modified_by: { id: 1, username: 'admin' },
      organization: { id: 1, name: 'Default', description: '' },
      inventory: {
        name: 'Test Inv',
        description: '',
        has_active_failures: false,
        has_inventory_sources: true,
        hosts_with_active_failures: 0,
        id: 10,
        inventory_sources_with_failures: 0,
        kind: '',
        organization_id: 1,
        total_groups: 0,
        total_hosts: 0,
        total_inventory_sources: 1,
      },
      user_capabilities: { edit: true, schedule: true, start: true, delete: true },
      last_job: {
        id: 42,
        description: '',
        failed: false,
        finished: '2024-01-01T00:00:00Z',
        license_error: false,
        name: 'Job 42',
        status: 'successful',
      },
      current_job: {
        id: 0,
        description: '',
        failed: false,
        finished: '',
        license_error: false,
        name: '',
        status: '',
      },
      execution_environment: {} as InventorySource['summary_fields']['execution_environment'],
      source_project: {} as InventorySource['summary_fields']['source_project'],
      credential: {} as InventorySource['summary_fields']['credential'],
    },
    related: { schedules: '' },
    ...overrides,
  } as InventorySource;
}

function getStatusColumn(options?: Parameters<typeof useInventorySourceColumns>[0]) {
  const { result } = renderHook(() => useInventorySourceColumns(options), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
  return result.current.find((col) => col.header === 'Last job status');
}

function renderStatusCell(
  inventorySource: InventorySource,
  options?: Parameters<typeof useInventorySourceColumns>[0]
) {
  const col = getStatusColumn(options);
  if (!col?.cell) throw new Error('Status column or cell not found');
  const cellContent = col.cell(inventorySource);
  return render(<MemoryRouter>{cellContent}</MemoryRouter>);
}

describe('useInventorySourceColumns — status column', () => {
  it('last_job.id present → renders a link whose href contains that id', () => {
    const source = makeInventorySource({
      summary_fields: {
        ...makeInventorySource().summary_fields,
        last_job: {
          id: 99,
          description: '',
          failed: false,
          finished: '2024-01-01T00:00:00Z',
          license_error: false,
          name: 'Job 99',
          status: 'successful',
        },
      },
    });

    renderStatusCell(source);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/jobs/inventory/99/output');
  });

  it('no last_job → does not render a link', () => {
    const source = makeInventorySource();
    (source.summary_fields as Record<string, unknown>).last_job = undefined;

    renderStatusCell(source);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('last_job object without id → does not render a link', () => {
    const source = makeInventorySource();
    (source.summary_fields as Record<string, unknown>).last_job = {
      description: 'broken',
      failed: true,
      finished: '',
      license_error: false,
      name: 'No ID Job',
      status: 'failed',
    };

    renderStatusCell(source);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('disableLinks: true → no link even when last_job.id exists', () => {
    const source = makeInventorySource();

    renderStatusCell(source, { disableLinks: true });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
>>>>>>> 421aa6b95 (fix: project status link missing and inventory source last job status link malformed)
  });
});
