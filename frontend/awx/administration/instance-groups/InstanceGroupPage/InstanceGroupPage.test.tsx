import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceGroupPage } from './InstanceGroupPage';

const mockInstanceGroup = {
  id: 1,
  name: 'Test IG',
  is_container_group: false,
  summary_fields: { user_capabilities: {} },
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('instance_groups') && request.url.includes('/1/'),
    () => HttpResponse.json(mockInstanceGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupPage', () => {
  it('should display instance group name in page header', async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1']}>
        <Routes>
          <Route path="/instance-groups/:id" element={<InstanceGroupPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('page-title')).toHaveTextContent('Test IG');
    });
  });
});
