/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaUserDetails } from './EdaUserDetails';

const mockUser = {
  id: 42,
  username: 'testuser',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  is_superuser: false,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

const server = setupServer(http.get('*/users/42/', () => HttpResponse.json(mockUser)));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderEdaUserDetails() {
  return render(
    <MemoryRouter initialEntries={['/users/42/details']}>
      <Routes>
        <Route path="/users/:id/details" element={<EdaUserDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('EdaUserDetails', () => {
  it('should render user details with username', async () => {
    renderEdaUserDetails();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should render user first name and last name', async () => {
    renderEdaUserDetails();

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should render loading page when user is not yet loaded', () => {
    server.use(
      http.get('*/users/99/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockUser);
      })
    );

    render(
      <MemoryRouter initialEntries={['/users/99/details']}>
        <Routes>
          <Route path="/users/:id/details" element={<EdaUserDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });

  it('should render user email', async () => {
    renderEdaUserDetails();

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
