import { render, screen, waitFor } from '@testing-library/react';
import { SwrTestWrapper } from '../../../../framework/test-utils/swrTestWrapper';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { PlatformAuthenticatorMappingDetailsInner } from './PlatformAuthenticatorMappingDetails';
import { AuthenticatorMap, AuthenticatorMapType } from '../../../interfaces/AuthenticatorMap';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockAllowMapping from './authenticatorMappingAllowDetails.fixture.json';
import mockOrgMapping from './authenticatorMappingOrgDetails.fixture.json';
import mockRoleMapping from './authenticatorMappingRoleDetails.fixture.json';
import mockMappings from './authenticatorMappings.fixture.json';
import mockSuperuserMapping from './authenticatorMappingSuperuserDetails.fixture.json';
import mockTeamMapping from './authenticatorMappingTeamDetails.fixture.json';
import { PlatformAuthenticatorMappingDetails } from './PlatformAuthenticatorMappingDetails';

describe('PlatformAuthenticatorMappingDetailsInner', () => {
  test('should show revoke option and groups labels when present', () => {
    const mapping = {
      id: 44,
      name: 'revoke-mapping',
      map_type: AuthenticatorMapType.allow,
      order: 1,
      revoke: true,
      organization: '',
      role: '',
      team: '',
      ui_summary: 'allow map',
      triggers: { groups: { has_and: ['group-a', 'group-b'] } },
      url: '',
      created: '',
      modified: '',
      related: {},
      authenticator: 1,
      summary_fields: {} as AuthenticatorMap['summary_fields'],
    } as AuthenticatorMap;

    render(
      <MemoryRouter>
        <PlatformAuthenticatorMappingDetailsInner mapping={mapping} />
      </MemoryRouter>,
      { wrapper: SwrTestWrapper }
    );

    expect(screen.getByTestId('rule-name')).toHaveTextContent('revoke-mapping');
    expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Based on groups');
    expect(screen.getByTestId('groups')).toBeInTheDocument();
  });
});

describe('PlatformAuthenticatorMappingDetails for Team Mapping', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/24/`, () => {
      return HttpResponse.json(mockMappings);
    }),
    http.get(gatewayAPI`/authenticator_maps/1/`, () => {
      return HttpResponse.json(mockTeamMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render details for team mapping with always trigger', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/24/mappings/1/details']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/details'}
            element={<PlatformAuthenticatorMappingDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rule-name')).toHaveTextContent('team-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('team map');
      expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Always');
      expect(screen.getByTestId('organization')).toHaveTextContent('Default');
      expect(screen.getByTestId('team')).toHaveTextContent('test-team');
      expect(screen.getByTestId('role')).toHaveTextContent('Team Member');
    });
  });
});

describe('PlatformAuthenticatorMappingDetails for Allow Mapping', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/24/`, () => {
      return HttpResponse.json(mockMappings);
    }),
    http.get(gatewayAPI`/authenticator_maps/1/`, () => {
      return HttpResponse.json(mockAllowMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  test('should render details for allow mapping with never trigger', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/24/mappings/1/details']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/details'}
            element={<PlatformAuthenticatorMappingDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rule-name')).toHaveTextContent('allow-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('allow map');
      expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Never');
    });
  });
});

describe('PlatformAuthenticatorMappingDetails for Organization Mapping', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/24/`, () => {
      return HttpResponse.json(mockMappings);
    }),
    http.get(gatewayAPI`/authenticator_maps/1/`, () => {
      return HttpResponse.json(mockOrgMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  test('should render details for organization mapping with groups trigger', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/24/mappings/1/details']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/details'}
            element={<PlatformAuthenticatorMappingDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rule-name')).toHaveTextContent('org-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('organization map');
      expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Based on groups');
      expect(screen.getByTestId('groups')).toHaveTextContent('group1');
      expect(screen.getByTestId('groups')).toHaveTextContent('group2');
    });
  });
});

describe('PlatformAuthenticatorMappingDetails for Role Mapping', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/24/`, () => {
      return HttpResponse.json(mockMappings);
    }),
    http.get(gatewayAPI`/authenticator_maps/1/`, () => {
      return HttpResponse.json(mockRoleMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  test('should render details for role mapping with attributes trigger', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/24/mappings/1/details']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/details'}
            element={<PlatformAuthenticatorMappingDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rule-name')).toHaveTextContent('role-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('role map');
      expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Based on attributes');
      expect(screen.getByTestId('attr1-name')).toHaveTextContent('attr1');
      expect(screen.getByTestId('attr1-comparison')).toHaveTextContent('contains');
      expect(screen.getByTestId('attr1-value')).toHaveTextContent('value1');
      expect(screen.getByTestId('attr2-name')).toHaveTextContent('attr2');
      expect(screen.getByTestId('attr2-comparison')).toHaveTextContent('contains');
      expect(screen.getByTestId('attr2-value')).toHaveTextContent('value2');
    });
  });
});

describe('PlatformAuthenticatorMappingDetails for is_superuser Mapping', () => {
  const server = setupServer(
    http.get(gatewayAPI`/authenticators/24/`, () => {
      return HttpResponse.json(mockMappings);
    }),
    http.get(gatewayAPI`/authenticator_maps/1/`, () => {
      return HttpResponse.json(mockSuperuserMapping);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  test('should render details for superuser mapping with always trigger', async () => {
    render(
      <MemoryRouter initialEntries={['/access/authenticators/24/mappings/1/details']}>
        <Routes>
          <Route
            path={'/access/authenticators/:id/mappings/:map_id/details'}
            element={<PlatformAuthenticatorMappingDetails />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('rule-name')).toHaveTextContent('superuser-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('is_superuser map');
      expect(screen.getByTestId('when-to-run-the-rule')).toHaveTextContent('Always');
    });
  });
});
