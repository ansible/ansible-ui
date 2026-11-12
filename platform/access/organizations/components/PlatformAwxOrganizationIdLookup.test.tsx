import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformAwxOrganizationIdLookup } from './PlatformAwxOrganizationIdLookup';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    LoadingPage: () => <div data-testid="loading-page">Loading</div>,
  };
});

vi.mock('@ansible/ansible-ui-framework/components/EmptyStateCustom', () => ({
  EmptyStateCustom: (props: Readonly<{ title: string }>) => (
    <div data-testid="empty-state">{props.title}</div>
  ),
}));

vi.mock('@ansible/awx-ui/common/AwxError', () => ({
  AwxError: (props: Readonly<{ error: { message: string } }>) => (
    <div data-testid="awx-error">{props.error.message}</div>
  ),
}));

const getMocks = vi.hoisted(() => ({
  useGetItem: vi.fn(),
  useGet: vi.fn(),
}));

vi.mock('@ansible/common-ui/crud/useGet', async () => {
  const actual = await vi.importActual<typeof import('@ansible/common-ui/crud/useGet')>(
    '@ansible/common-ui/crud/useGet'
  );
  return {
    ...actual,
    useGetItem: getMocks.useGetItem as typeof actual.useGetItem,
    useGet: getMocks.useGet as typeof actual.useGet,
  };
});

const gatewayOrg: PlatformOrganization = {
  id: 10,
  name: 'Gateway Org',
  description: '',
  url: '/api/v1/organizations/10/',
  created: '',
  created_by: 1,
  modified: '',
  modified_by: 1,
  managed: false,
  related: { created_by: '', modified_by: '', teams: '' },
  summary_fields: {
    resource: { ansible_id: 'ansible-org-id', resource_type: 'organization' },
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
  },
};

function Child(props: Readonly<{ id?: string }>) {
  return <div data-testid="child-id">{props.id ?? 'none'}</div>;
}

function renderLookup() {
  return render(
    <MemoryRouter initialEntries={['/organizations/10']}>
      <Routes>
        <Route
          path="/organizations/:id"
          element={
            <PlatformAwxOrganizationIdLookup>
              <Child />
            </PlatformAwxOrganizationIdLookup>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlatformAwxOrganizationIdLookup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMocks.useGetItem.mockReturnValue({
      data: gatewayOrg,
      error: undefined,
    });
  });

  it('shows loading while AWX organizations are loading', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });
    renderLookup();
    expect(screen.getByTestId('loading-page')).toBeInTheDocument();
  });

  it('renders AwxError when AWX fetch fails', () => {
    getMocks.useGet.mockReturnValue({
      data: undefined,
      error: new Error('fetch failed'),
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('awx-error')).toHaveTextContent('fetch failed');
  });

  it('shows not found when AWX returns zero or multiple matches', () => {
    getMocks.useGet.mockReturnValue({
      data: { results: [] },
      error: undefined,
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('Resource Not Found');
  });

  it('passes AWX organization id to child', () => {
    getMocks.useGet.mockReturnValue({
      data: { count: 1, results: [{ id: 42, name: 'AWX Org' }] },
      error: undefined,
      isLoading: false,
    });
    renderLookup();
    expect(screen.getByTestId('child-id')).toHaveTextContent('42');
  });
});
