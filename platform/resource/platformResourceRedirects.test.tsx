import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { PlatformAwxOrganization } from './PlatformAwxOrganization';
import { PlatformAwxTeam } from './PlatformAwxTeam';
import { PlatformAwxUser } from './PlatformAwxUser';
import { PlatformEdaOrganization } from './PlatformEdaOrganization';
import { PlatformEdaUser } from './PlatformEdaUser';
import { PlatformHubTeam } from './PlatformHubTeam';
import { PlatformHubUser } from './PlatformHubUser';
import { registerPlatformResourceRedirectTests } from './platformResourceRedirectTestUtils';

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => vi.fn(() => '/mock-resource-route'),
  };
});

vi.mock('../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: () => ({ activePlatformUser: { id: 1 } }),
}));

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Regression coverage for #3367: failed requests must render EmptyStateCustom, not fall through.
registerPlatformResourceRedirectTests(server, {
  description: 'PlatformAwxUser',
  Component: PlatformAwxUser,
  apiUrls: [awxAPI`/users/1/`, '/api/v2/users/1/'],
  routePath: 'users/:id',
  notFoundResponse: { id: 1, summary_fields: { resource: {} } },
  successResponse: {
    id: 1,
    summary_fields: {
      resource: { resource_type: 'shared.user', ansible_id: 'abc-123' },
    },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformAwxOrganization',
  Component: PlatformAwxOrganization,
  apiUrls: [awxAPI`/organizations/1/`, '/api/v2/organizations/1/'],
  routePath: 'organizations/:id',
  notFoundResponse: { id: 1, summary_fields: { resource: {} } },
  successResponse: {
    id: 1,
    summary_fields: {
      resource: { resource_type: 'shared.organization', ansible_id: 'org-123' },
    },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformAwxTeam',
  Component: PlatformAwxTeam,
  apiUrls: [awxAPI`/teams/1/`, '/api/v2/teams/1/'],
  routePath: 'teams/:id',
  notFoundResponse: { id: 1, summary_fields: { resource: {} } },
  successResponse: {
    id: 1,
    summary_fields: {
      resource: { resource_type: 'shared.team', ansible_id: 'team-123' },
    },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformEdaUser',
  Component: PlatformEdaUser,
  apiUrls: [edaAPI`/users/1/`],
  routePath: 'users/:id',
  notFoundResponse: { id: 1, resource: {} },
  successResponse: {
    id: 1,
    resource: { resource_type: 'shared.user', ansible_id: 'eda-user-123' },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformEdaOrganization',
  Component: PlatformEdaOrganization,
  apiUrls: [edaAPI`/organizations/1/`],
  routePath: 'organizations/:id',
  notFoundResponse: { id: 1, resource: {} },
  successResponse: {
    id: 1,
    resource: { resource_type: 'shared.organization', ansible_id: 'eda-org-123' },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformHubUser',
  Component: PlatformHubUser,
  apiUrls: [hubAPI`/_ui/v2/users/1/`],
  routePath: 'users/:id',
  notFoundResponse: { id: 1, resource: {} },
  successResponse: {
    id: 1,
    resource: { resource_type: 'shared.user', ansible_id: 'hub-user-123' },
  },
});

registerPlatformResourceRedirectTests(server, {
  description: 'PlatformHubTeam',
  Component: PlatformHubTeam,
  apiUrls: [hubAPI`/_ui/v2/teams/1/`],
  routePath: 'teams/:id',
  notFoundResponse: { id: 1, resource: {} },
  successResponse: {
    id: 1,
    resource: { resource_type: 'shared.team', ansible_id: 'hub-team-123' },
  },
});
