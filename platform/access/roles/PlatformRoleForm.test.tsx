import { render, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { gatewayAPI } from '../../utils/gateway-api-utils';

import roleDefinition from './mocks/roleDefinition.fixture.json';
import roleTypes from './mocks/roleTypes.fixture.json';
import rolePermissions from './mocks/roleOrganizationPermissions.fixture.json';
import { CreatePlatformRole, EditPlatformRole } from './PlatformRoleForm';

describe('platformRoleForm', () => {
  const server = setupServer(
    http.get(gatewayAPI`/role_definitions/1/*`, () => {
      return HttpResponse.json(roleDefinition);
    }),
    http.get(gatewayAPI`/service-index/role-types/*`, () => {
      return HttpResponse.json(roleTypes);
    }),
    http.get(gatewayAPI`/service-index/role-permissions/*`, () => {
      return HttpResponse.json(rolePermissions);
    })
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => {
    vi.restoreAllMocks();
    server.close();
  });

  beforeEach(() => {
    vi.mock('react-i18next', () => ({
      useTranslation: () => {
        return {
          t: (str: string) => str,
          i18n: {
            changeLanguage: () => new Promise(() => {}),
          },
        };
      },
      initReactI18next: {
        type: '3rdParty',
        init: () => {},
      },
    }));
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should render the create role form', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/roles/create']}>
        <Routes>
          <Route path={'/access/roles/create'} element={<CreatePlatformRole />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByRole('button', { name: 'Create role' })).toBeInTheDocument();
  });

  test('should render the edit role form', async () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/access/roles/1/edit']}>
        <Routes>
          <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByRole('button', { name: 'Save role' })).toBeInTheDocument();
    });
  });

  test('should display the role fields pre-populated', async () => {
    const { container, findByText } = render(
      <MemoryRouter initialEntries={['/access/roles/1/edit']}>
        <Routes>
          <Route path={'/access/roles/:id/edit'} element={<EditPlatformRole />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(container.querySelector('[id="name"]')).toHaveValue('Demo role');
    });
    await waitFor(() => {
      expect(container.querySelector('[id="description"]')).toHaveValue('This is a demo role');
    });
    expect(await findByText('activation')).toBeInTheDocument();
    expect(await findByText('Can view activation')).toBeInTheDocument();
    expect(await findByText('Can restart an activation')).toBeInTheDocument();
  });
});
