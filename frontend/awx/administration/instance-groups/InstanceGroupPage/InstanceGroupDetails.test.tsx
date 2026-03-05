import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { InstanceGroupDetails } from './InstanceGroupDetails';

const instanceGroup = {
  id: 1,
  type: 'instance_group',
  url: '/api/v2/instance_groups/1/',
  name: 'Test Instance Group',
  capacity: 0,
  policy_instance_minimum: 0,
  policy_instance_percentage: 0,
  max_concurrent_jobs: 0,
  max_forks: 0,
  is_container_group: false,
  summary_fields: { user_capabilities: {} },
  created: '',
  modified: '',
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('instance_groups') && request.url.includes('/1/'),
    () => HttpResponse.json(instanceGroup)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InstanceGroupDetails', () => {
  it('should render instance group name and details', async () => {
    render(
      <MemoryRouter initialEntries={['/instance-groups/1/details']}>
        <Routes>
          <Route path="/instance-groups/:id/details" element={<InstanceGroupDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Instance Group')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });
});
