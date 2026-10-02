/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaTeamRoles } from './EdaTeamRoles';

const server = setupServer(
  http.get('*/role_team_assignments/*', () => HttpResponse.json({ count: 0, results: [] })),
  http.options('*/role_definitions*', () => HttpResponse.json({ actions: { POST: {} } }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaTeamRoles', () => {
  it('should render roles heading when provided an explicit id', { timeout: 15000 }, async () => {
    render(
      <MemoryRouter>
        <EdaTeamRoles id="10" />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Add roles')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  });

  it(
    'should render roles heading when id comes from route params',
    { timeout: 15000 },
    async () => {
      render(
        <MemoryRouter initialEntries={['/teams/10/roles']}>
          <Routes>
            <Route path="/teams/:id/roles" element={<EdaTeamRoles />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('Add roles')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }
  );

  it(
    'should render roles heading with a custom addRolesRoute prop',
    { timeout: 15000 },
    async () => {
      render(
        <MemoryRouter>
          <EdaTeamRoles id="10" addRolesRoute="custom-route" />
        </MemoryRouter>
      );

      await waitFor(
        () => {
          expect(screen.getByText('Add roles')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }
  );
});
