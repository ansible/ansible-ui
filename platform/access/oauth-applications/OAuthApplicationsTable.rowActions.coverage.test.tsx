import { Application } from '@ansible/awx-ui/interfaces/Application';
import {
  IPageAction,
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
  PageTableProps,
} from '@ansible/ansible-ui-framework';
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { resetTestSwrCache, SwrTestWrapper } from '../../../framework/test-utils/swrTestWrapper';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { OAuthApplicationsTable } from './OAuthApplicationsTable';

const mockActiveUser: PlatformUser = {
  id: 1,
  url: '/api/gateway/v1/users/1/',
  created: '2024-01-01T00:00:00Z',
  created_by: 'admin',
  modified: '2024-01-01T00:00:00Z',
  modified_by: 'admin',
  related: {},
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  is_superuser: true,
  is_platform_auditor: false,
  last_login_map_results: [],
  last_login: '2024-01-01T00:00:00Z',
  managed: false,
  summary_fields: {
    modified_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    created_by: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
    },
    resource: {
      ansible_id: 'test-ansible-id',
      resource_type: 'shared.user',
    },
  },
};

vi.mock('../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: vi.fn(() => ({ activePlatformUser: mockActiveUser })),
}));

const mockPageNavigate = vi.fn();
const mockBulkDelete = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    PageTable: (props: PageTableProps<Application>) => {
      lastCapturedRowActions = props.rowActions ?? [];
      return <div data-testid="page-table-stub" />;
    },
  };
});

vi.mock('./hooks/useDeleteOAuthApplications', () => ({
  useDeleteOAuthApplications: () => mockBulkDelete,
}));

let lastCapturedRowActions: IPageAction<Application>[] = [];

const sampleApp: Application = {
  id: 1,
  name: 'Test OAuth Application',
  description: '',
  url: '/api/gateway/v1/applications/1/',
  app_url: 'https://example.com',
  client_type: 'confidential',
  redirect_uris: 'https://example.com/callback',
  organization: 1,
  type: 'o_auth2_application',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-02T00:00:00Z',
  client_id: 'cid',
  client_secret: 'sec',
  authorization_grant_type: 'authorization-code',
  skip_authorization: false,
  pkce_required: true,
  summary_fields: {
    user_capabilities: {
      edit: true,
      delete: true,
    },
    organization: {
      id: 1,
      name: 'Default',
      description: '',
    },
  },
};

const mockOptionsResponse = {
  actions: {
    GET: {},
    POST: {},
  },
};

const server = setupServer(
  http.get(gatewayAPI`/applications/`, () => HttpResponse.json({ results: [sampleApp], count: 1 })),
  http.options(gatewayAPI`/applications/`, () => HttpResponse.json(mockOptionsResponse))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('OAuthApplicationsTable row action handlers', () => {
  beforeEach(() => {
    server.resetHandlers();
    resetTestSwrCache();
    vi.clearAllMocks();
    lastCapturedRowActions = [];
  });

  function renderTable() {
    return render(
      <SwrTestWrapper>
        <MemoryRouter initialEntries={['/access/oauth-applications']}>
          <Routes>
            <Route path="/access/oauth-applications" element={<OAuthApplicationsTable />} />
          </Routes>
        </MemoryRouter>
      </SwrTestWrapper>
    );
  }

  test('row edit onClick navigates to edit route', async () => {
    renderTable();

    await waitFor(() => {
      expect(lastCapturedRowActions.length).toBeGreaterThan(0);
    });

    const edit = lastCapturedRowActions.find(
      (a): a is IPageActionButtonSingle<Application> =>
        a.type === PageActionType.Button &&
        a.selection === PageActionSelection.Single &&
        a.label === 'Edit OAuth application'
    );
    expect(edit).toBeDefined();
    edit?.onClick(sampleApp);

    expect(mockPageNavigate).toHaveBeenCalledWith(PlatformRoute.EditApplication, {
      params: { id: sampleApp.id },
    });
  });

  test('row delete onClick invokes bulk delete with selected application', async () => {
    renderTable();

    await waitFor(() => {
      expect(lastCapturedRowActions.length).toBeGreaterThan(0);
    });

    const del = lastCapturedRowActions.find(
      (a): a is IPageActionButtonSingle<Application> =>
        a.type === PageActionType.Button &&
        a.selection === PageActionSelection.Single &&
        a.label === 'Delete OAuth application'
    );
    expect(del).toBeDefined();
    del?.onClick(sampleApp);

    expect(mockBulkDelete).toHaveBeenCalledWith([sampleApp]);
  });
});
