import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { GroupDetails } from './GroupDetails';

const mockGroup = {
  id: 1,
  type: 'group',
  name: 'Test Group',
  description: 'A test group',
  url: '/api/v2/groups/1/',
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  variables: '---',
  summary_fields: {
    created_by: { id: 1, username: 'admin' },
  },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/groups/') && request.url.includes('/1'),
    () => HttpResponse.json(mockGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GroupDetails', () => {
  it('should display group name and description', async () => {
    render(
      <MemoryRouter initialEntries={['/groups/1']}>
        <Routes>
          <Route path="/groups/:group_id" element={<GroupDetails />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
    expect(screen.getByText('A test group')).toBeInTheDocument();
  });
});
