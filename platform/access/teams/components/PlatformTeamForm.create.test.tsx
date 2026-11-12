import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { CreatePlatformTeam } from './PlatformTeamForm';

const server = setupServer(
  http.options(gatewayAPI`/teams/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          name: { type: 'string', required: true },
          organization: { type: 'integer', required: true },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreatePlatformTeam', () => {
  it('loads OPTIONS and renders create form', async () => {
    render(
      <MemoryRouter initialEntries={['/teams/create']}>
        <Routes>
          <Route path="/teams/create" element={<CreatePlatformTeam />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create team/i })).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/^Name/i)).toBeInTheDocument();
  });
});
