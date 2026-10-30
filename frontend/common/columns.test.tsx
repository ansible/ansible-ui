import { ColumnTableOption } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  useAddressColumn,
  useCreatedColumn,
  useCredentialsColumn,
  useDescriptionColumn,
  useExecutionEnvColumn,
  useExpiresColumn,
  useIdColumn,
  useInventoryNameColumn,
  useLabelsColumn,
  useLastRanColumn,
  useModifiedColumn,
  useNameColumn,
  useOrganizationNameColumn,
  useProjectNameColumn,
  useScopeColumn,
  useTypeColumn,
} from './columns';

const mockPageNavigate = vi.fn();
const mockGetPageUrl = vi.fn((_route: string, options?: { params?: Record<string, unknown> }) => {
  const id = options?.params?.id;
  return `/resource/${String(id ?? '')}`;
});

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    useGetPageUrl: () => mockGetPageUrl,
  };
});

vi.mock('@ansible/awx-ui/common/CredentialLabel', () => ({
  CredentialLabel: ({ credential }: { credential: { name: string } }) => (
    <span>{credential.name}</span>
  ),
}));

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('shared column hooks', () => {
  it('useIdColumn should expose id cell and hidden table option by default', () => {
    const { result } = renderHook(() => useIdColumn());
    expect(result.current.header).toBe('ID');
    const cell = result.current.cell as ((item: { id: number }) => number) | undefined;
    expect(cell?.({ id: 9 })).toBe(9);
    expect(result.current.table).toBe(ColumnTableOption.hidden);
  });

  it('useNameColumn should map name and link target', () => {
    const to = (item: { name?: string }) => `/names/${item.name}`;
    const { result } = renderHook(() => useNameColumn({ to }));
    const valueFn = result.current.value as
      | ((item: { name?: string }) => string | undefined)
      | undefined;
    const toFn = result.current.to as ((item: { name?: string }) => string | undefined) | undefined;
    expect(valueFn?.({ name: 'demo' })).toBe('demo');
    expect(toFn?.({ name: 'demo' })).toBe('/names/demo');
  });

  it('useDescriptionColumn should map description value', () => {
    const { result } = renderHook(() => useDescriptionColumn());
    const value = result.current.value as ((item: { description: string }) => string) | undefined;
    expect(value?.({ description: 'desc' })).toBe('desc');
  });

  it('useLastRanColumn should render DateTimeCell when last_job_run exists', () => {
    const { result } = renderHook(() => useLastRanColumn());
    renderWithRouter(<>{result.current.cell?.({ last_job_run: '2024-01-01T00:00:00Z' })}</>);
    expect(screen.getByText(/2023|2024/)).toBeInTheDocument();
    expect(result.current.cell?.({ last_job_run: null })).toBeNull();
  });

  it('useLabelsColumn should map label names', () => {
    const { result } = renderHook(() => useLabelsColumn());
    expect(
      result.current.value?.({
        summary_fields: { labels: { count: 1, results: [{ id: 1, name: 'prod' }] } },
      })
    ).toEqual(['prod']);
  });

  it('useCredentialsColumn should render credential labels', () => {
    const { result } = renderHook(() => useCredentialsColumn());
    renderWithRouter(
      <>
        {result.current.cell?.({
          summary_fields: { credentials: [{ id: 1, name: 'Machine', kind: 'ssh' }] },
        })}
      </>
    );
    expect(screen.getByText('Machine')).toBeInTheDocument();
  });

  it('useCreatedColumn should navigate to user details when author is clickable', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useCreatedColumn());
    renderWithRouter(
      <>
        {result.current.cell?.({
          created: '2024-02-01T00:00:00Z',
          summary_fields: { created_by: { id: 3, username: 'alice' } },
        })}
      </>
    );

    await user.click(screen.getByText('alice'));
    expect(mockPageNavigate).toHaveBeenCalled();
  });

  it('useModifiedColumn should skip navigation for system user', () => {
    const { result } = renderHook(() => useModifiedColumn());
    renderWithRouter(
      <>
        {result.current.cell?.({
          modified: '2024-02-01T00:00:00Z',
          summary_fields: { modified_by: { id: 1, username: '_system' } },
        })}
      </>
    );
    expect(screen.queryByText('_system')).toBeInTheDocument();
  });

  it('useOrganizationNameColumn should render organization name', () => {
    const { result } = renderHook(() => useOrganizationNameColumn('org-details'));
    renderWithRouter(
      <>
        {result.current.cell?.({
          summary_fields: { organization: { id: 2, name: 'Default' } },
        })}
      </>
    );
    expect(screen.getByTestId('default-status')).toBeInTheDocument();
  });

  it('useExecutionEnvColumn should render only for job templates', () => {
    const { result } = renderHook(() => useExecutionEnvColumn('ee-details'));
    const { container: emptyContainer } = renderWithRouter(
      <>{result.current.cell?.({ type: 'workflow' })}</>
    );
    expect(emptyContainer).toBeEmptyDOMElement();
    renderWithRouter(
      <>
        {result.current.cell?.({
          type: 'job_template',
          summary_fields: { execution_environment: { id: 4, name: 'ee-minimal' } },
        })}
      </>
    );
    expect(screen.getByTestId('ee-minimal-status')).toBeInTheDocument();
  });

  it('useInventoryNameColumn should render inventory link', () => {
    const { result } = renderHook(() => useInventoryNameColumn('inventory-details'));
    const cell = result.current.cell as (item: {
      summary_fields?: { inventory?: { id: number; name: string; kind: string } };
    }) => ReactNode;
    renderWithRouter(
      <>
        {cell({
          summary_fields: { inventory: { id: 5, name: 'Local', kind: 'smart' } },
        })}
      </>
    );
    expect(screen.getByTestId('local-status')).toBeInTheDocument();
    expect(mockGetPageUrl).toHaveBeenCalled();
  });

  it('useProjectNameColumn should render project name', () => {
    const { result } = renderHook(() => useProjectNameColumn('project-details'));
    renderWithRouter(
      <>
        {result.current.cell?.({
          summary_fields: { project: { id: 6, name: 'Demo Project' } },
        })}
      </>
    );
    expect(screen.getByTestId('demo project-status')).toBeInTheDocument();
  });

  it('useTypeColumn should use makeReadable callback', () => {
    const { result } = renderHook(() =>
      useTypeColumn({ makeReadable: (item: { type?: string }) => item.type ?? 'unknown' })
    );
    expect(result.current.value?.({ type: 'job' })).toBe('job');
  });

  it('useScopeColumn should render scope text', () => {
    const { result } = renderHook(() => useScopeColumn());
    renderWithRouter(<>{result.current.cell?.({ scope: 'organization' })}</>);
    expect(screen.getByTestId('organization-status')).toBeInTheDocument();
  });

  it('useExpiresColumn should render expires datetime', () => {
    const { result } = renderHook(() => useExpiresColumn());
    renderWithRouter(<>{result.current.cell?.({ expires: '2025-01-01T00:00:00Z' })}</>);
    expect(screen.getByText(/2024|2025/)).toBeInTheDocument();
  });

  it('useAddressColumn should render address text', () => {
    const { result } = renderHook(() => useAddressColumn());
    const cell = result.current.cell as (item: { address: string }) => ReactNode;
    renderWithRouter(<>{cell({ address: 'node-1.example.com' })}</>);
    expect(screen.getByTestId('node-1.example.com-status')).toBeInTheDocument();
  });
});
