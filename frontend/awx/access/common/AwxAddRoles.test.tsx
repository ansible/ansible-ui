/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxAddRoles } from './AwxAddRoles';

const roleDefinitionsOptions = {
  actions: {
    GET: {
      content_type: {
        choices: [
          ['awx.organization', 'Organization'],
          ['awx.project', 'Project'],
          ['awx.inventory', 'Inventory'],
        ],
      },
    },
  },
};

const server = setupServer(
  http.options(awxAPI`/role_definitions/`, () => HttpResponse.json(roleDefinitionsOptions)),
  http.get(
    ({ request }) => request.url.includes('role_definitions'),
    () =>
      HttpResponse.json({
        count: 0,
        results: [],
        next: null,
        previous: null,
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxAddRoles', () => {
  it('should render wizard with Select a resource type step', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <AwxAddRoles id="1" type="user" userOrTeamName="testuser" onClose={() => {}} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
        expect(screen.getAllByText('Select a resource type').length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );
  });

  it('should render wizard steps for team type', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <AwxAddRoles id="2" type="team" userOrTeamName="Test Team" onClose={() => {}} />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByTestId('wizard')).toBeInTheDocument();
        expect(screen.getByText('Select resources')).toBeInTheDocument();
        expect(screen.getByText('Select roles to apply')).toBeInTheDocument();
        expect(screen.getByText('Review')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });
});
