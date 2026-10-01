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
  });
});
