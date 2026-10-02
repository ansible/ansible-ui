/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RulebookActivationUserAccess } from './RuleBookActivationUserAccess';

const server = setupServer(
  http.get('*/role_user_access/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_user_assignments/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.get('*/role_definitions/*', () => {
    return HttpResponse.json({ count: 0, results: [] });
  })
);

describe('RulebookActivationUserAccess', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render ResourceUserAccess component', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/user-access']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/user-access"
            element={<RulebookActivationUserAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No users assigned to this rulebook activation/i)
      ).toBeInTheDocument();
    });
  });

  it('should render user access description text', async () => {
    render(
      <MemoryRouter initialEntries={['/rulebook-activations/5/user-access']}>
        <Routes>
          <Route
            path="/rulebook-activations/:id/user-access"
            element={<RulebookActivationUserAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/list of users with access to this resource/i)).toBeInTheDocument();
    });
  });
});
