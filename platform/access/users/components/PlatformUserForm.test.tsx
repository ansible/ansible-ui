import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { CreatePlatformUser } from './PlatformUserForm';

const server = setupServer(
  http.get(gatewayAPI`/role_definitions/`, () =>
    HttpResponse.json({
      count: 1,
      results: [{ id: 1, name: 'Platform Auditor' }],
    })
  ),
  http.options(gatewayAPI`/users/`, () =>
    HttpResponse.json({
      actions: {
        POST: {
          username: { type: 'string', required: true },
          password: { type: 'string', required: true },
        },
      },
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreatePlatformUser', () => {
  it('should load OPTIONS data and render form', async () => {
    render(
      <MemoryRouter initialEntries={['/users/create']}>
        <Routes>
          <Route path="/users/create" element={<CreatePlatformUser />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create user/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    });
  });
});
