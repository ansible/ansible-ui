import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import mockTeamMapping from './authenticatorMappingTeamDetails.fixture.json';
import mockAllowMapping from './authenticatorMappingAllowDetails.fixture.json';
import mockOrgMapping from './authenticatorMappingOrgDetails.fixture.json';
import mockRoleMapping from './authenticatorMappingRoleDetails.fixture.json';
import mockSuperuserMapping from './authenticatorMappingSuperuserDetails.fixture.json';
import mockMappings from './authenticatorMappings.fixture.json';
import { PlatformAuthenticatorMappingDetails } from './PlatformAuthenticatorMappingDetails';

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
      expect(screen.getByTestId('name')).toHaveTextContent('team-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('{{mapType}} map');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Always');
      expect(screen.getByTestId('organization')).toHaveTextContent('Default');
      expect(screen.getByTestId('team')).toHaveTextContent('test-team');
      expect(screen.getByTestId('role')).toHaveTextContent('Team Member');
      expect(screen.getByTestId('created')).toHaveTextContent('5/12/2025, 12:03:02 PM by dev');
      expect(screen.getByTestId('last-modified')).toHaveTextContent(
        '5/12/2025, 12:03:02 PM by dev'
      );
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
      expect(screen.getByTestId('name')).toHaveTextContent('allow-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('{{mapType}} map');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Never');
      expect(screen.getByTestId('created')).toHaveTextContent('5/12/2025, 12:03:02 PM by dev');
      expect(screen.getByTestId('last-modified')).toHaveTextContent(
        '5/12/2025, 12:03:02 PM by dev'
      );
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
      expect(screen.getByTestId('name')).toHaveTextContent('org-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('{{mapType}} map');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Groups');
      expect(screen.getByTestId('groups')).toHaveTextContent('group1');
      expect(screen.getByTestId('groups')).toHaveTextContent('group2');
      expect(screen.getByTestId('created')).toHaveTextContent('5/12/2025, 12:03:02 PM by dev');
      expect(screen.getByTestId('last-modified')).toHaveTextContent(
        '5/12/2025, 12:03:02 PM by dev'
      );
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
      expect(screen.getByTestId('name')).toHaveTextContent('role-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('{{mapType}} map');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Attributes');
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
      expect(screen.getByTestId('name')).toHaveTextContent('superuser-mapping');
      expect(screen.getByTestId('type')).toHaveTextContent('{{mapType}} map');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Always');
      expect(screen.getByTestId('created')).toHaveTextContent('5/12/2025, 12:03:02 PM by dev');
      expect(screen.getByTestId('last-modified')).toHaveTextContent(
        '5/12/2025, 12:03:02 PM by dev'
      );
    });
  });
});
