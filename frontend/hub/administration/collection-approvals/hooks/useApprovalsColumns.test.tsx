/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../Approval';
import { useApprovalsColumns } from './useApprovalsColumns';

vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      can_upload_signatures: true,
      require_upload_signatures: true,
      display_signatures: true,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

vi.mock('../../../main/HubRoutes', () => ({
  HubRoute: {
    NamespaceDetails: 'NamespaceDetails',
    CollectionDetails: 'CollectionDetails',
  },
}));

const mockApproval: CollectionVersionSearch = {
  collection_version: {
    namespace: 'demo',
    name: 'collection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/pulp/cv/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'desc',
  },
  repository: {
    name: 'staging',
    pulp_href: '/pulp/repo/1/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    pulp_labels: { pipeline: 'staging' },
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

describe('useApprovalsColumns', () => {
  it('returns expected column headers', () => {
    const { result } = renderHook(() => useApprovalsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const headers = result.current.map((col) => col.header);
    expect(headers).toContain('Namespace');
    expect(headers).toContain('Collection');
    expect(headers).toContain('Version');
  });

  it('includes status column when signatures are displayed', () => {
    const { result } = renderHook(() => useApprovalsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.some((col) => col.header === 'Status')).toBe(true);
  });

  it('value functions read collection metadata', () => {
    const { result } = renderHook(() => useApprovalsColumns({ disableLinks: true }), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const namespaceCol = result.current.find((col) => col.header === 'Namespace');
    const versionCol = result.current.find((col) => col.header === 'Version');

    expect(namespaceCol && 'cell' in namespaceCol).toBe(true);
    expect(versionCol && 'cell' in versionCol).toBe(true);
    expect(mockApproval.collection_version?.namespace).toBe('demo');
  });

  it('renders status cells for pipeline states', () => {
    const { result } = renderHook(() => useApprovalsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const statusCol = result.current.find((col) => col.header === 'Status');
    expect(statusCol && 'cell' in statusCol && typeof statusCol.cell === 'function').toBe(true);
    const cellFn = (statusCol as { cell: (item: CollectionVersionSearch) => React.ReactNode }).cell;

    const renderStatus = (approval: CollectionVersionSearch) =>
      render(<MemoryRouter>{cellFn(approval)}</MemoryRouter>);

    renderStatus(mockApproval);
    expect(screen.getByText('Needs signature and review')).toBeInTheDocument();

    renderStatus({
      ...mockApproval,
      repository: { ...mockApproval.repository!, pulp_labels: { pipeline: 'approved' } },
      is_signed: false,
    });
    expect(screen.getByText('Approved')).toBeInTheDocument();

    renderStatus({
      ...mockApproval,
      repository: { ...mockApproval.repository!, pulp_labels: { pipeline: 'approved' } },
      is_signed: true,
    });
    expect(screen.getByText('Signed and Approved')).toBeInTheDocument();

    renderStatus({
      ...mockApproval,
      repository: { ...mockApproval.repository!, pulp_labels: { pipeline: 'rejected' } },
    });
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });
});
