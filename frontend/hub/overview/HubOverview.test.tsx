/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubContextProvider } from '../common/useHubContext';
import { HubOverview } from './HubOverview';

const mockHubAdmin = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  is_partner_engineer: false,
  email: '',
  groups: [],
  auth_provider: [],
};

const mockHubSettings = {
  GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_DOWNLOAD: false,
  GALAXY_ENABLE_UNAUTHENTICATED_COLLECTION_ACCESS: false,
  GALAXY_REQUIRE_CONTENT_APPROVAL: true,
  GALAXY_REQUIRE_SIGNATURE_FOR_APPROVAL: false,
  GALAXY_SIGNATURE_UPLOAD_ENABLED: false,
  GALAXY_AUTO_SIGN_COLLECTIONS: false,
  GALAXY_COLLECTION_SIGNING_SERVICE: null,
  GALAXY_CONTAINER_SIGNING_SERVICE: null,
  GALAXY_DISPLAY_SIGNATURES: false,
  GALAXY_FEATURE_FLAGS: {},
};

const mockFeatureFlags = {
  execution_environments: true,
  legacy_roles: false,
  container_signing: false,
  can_create_signatures: false,
  can_upload_signatures: false,
  display_signatures: false,
  collection_signing: false,
  require_upload_signatures: false,
  signatures_enabled: false,
  ai_deny_index: false,
  external_authentication: false,
  collection_auto_sign: false,
  display_repositories: false,
};

describe('HubOverview', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('displays "Manage view" button for admins', async () => {
    server.use(
      http.get('*/_ui/v1/me/', () => {
        return HttpResponse.json(mockHubAdmin);
      }),
      http.get('*/_ui/v1/settings/', () => {
        return HttpResponse.json(mockHubSettings);
      }),
      http.get('*/_ui/v1/feature-flags/', () => {
        return HttpResponse.json(mockFeatureFlags);
      }),
      http.get('*/v3/plugin/ansible/search/collection-versions/*', () => {
        return HttpResponse.json({ meta: { count: 0 }, links: {}, data: [] });
      })
    );

    render(
      <MemoryRouter>
        <HubContextProvider>
          <HubOverview />
        </HubContextProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage view' })).toBeInTheDocument();
    });
  });

  it('displays "Manage view" button for non-admin users too', async () => {
    const nonAdminUser = { ...mockHubAdmin, is_superuser: false };

    server.use(
      http.get('*/_ui/v1/me/', () => {
        return HttpResponse.json(nonAdminUser);
      }),
      http.get('*/_ui/v1/settings/', () => {
        return HttpResponse.json(mockHubSettings);
      }),
      http.get('*/_ui/v1/feature-flags/', () => {
        return HttpResponse.json(mockFeatureFlags);
      }),
      http.get('*/v3/plugin/ansible/search/collection-versions/*', () => {
        return HttpResponse.json({ meta: { count: 0 }, links: {}, data: [] });
      })
    );

    render(
      <MemoryRouter>
        <HubContextProvider>
          <HubOverview />
        </HubContextProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Manage view' })).toBeInTheDocument();
    });
  });
});
