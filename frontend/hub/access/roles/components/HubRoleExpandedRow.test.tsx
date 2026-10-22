/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ContentTypeEnum } from '../../../interfaces/expanded/ContentType';
import { HubRoleExpandedRow } from './HubRoleExpandedRow';

const mockRole = {
  id: 2,
  name: 'Namespace Admin',
  description: 'Admin',
  managed: true,
  content_type: ContentTypeEnum.Namespace,
  permissions: ['galaxy.view_namespace'],
  modified: '',
  created: '',
  url: '',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  modified_by: null,
  created_by: null,
};

describe('HubRoleExpandedRow', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('shows loading state then permissions', async () => {
    server.use(http.get('*/_ui/v2/role_definitions/2/', () => HttpResponse.json(mockRole)));

    render(
      <MemoryRouter>
        <HubRoleExpandedRow role={mockRole} />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    });
  });
});
