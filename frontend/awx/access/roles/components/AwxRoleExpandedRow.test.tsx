import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';
import { ContentTypeEnum } from '../../../interfaces/ContentType';
import { AwxRoleExpandedRow } from './AwxRoleExpandedRow';

const mockRole: AwxRbacRole = {
  id: 1,
  name: 'Admin',
  content_type: ContentTypeEnum.Organization,
  permissions: ['awx.change_organization', 'awx.view_organization'],
  url: '/api/v2/role_definitions/1/',
  related: { team_assignments: '', user_assignments: '' },
  summary_fields: {},
  created: '',
  modified: '',
  description: '',
  managed: true,
  created_by: null,
  modified_by: null,
};

const mockRoleDetails: AwxRbacRole = {
  ...mockRole,
  permissions: ['awx.change_organization', 'awx.view_organization'],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/role_definitions/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockRoleDetails)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRoleExpandedRow', () => {
  it('should render role permissions after loading', async () => {
    render(
      <MemoryRouter>
        <AwxRoleExpandedRow role={mockRole} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    });
  });
});
