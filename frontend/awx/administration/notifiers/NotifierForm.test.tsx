import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { AddNotifier } from './NotifierForm';

vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => ({
  DataEditor: (props: {
    id?: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      id={props.id ?? props.name}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      data-testid={props.name}
    />
  ),
}));

const mockNotificationTemplateOptions = {
  actions: {
    GET: {
      notification_configuration: {
        email: {
          username: { label: 'Username', type: 'string', default: '' },
          password: { label: 'Password', type: 'password', default: '' },
          host: { label: 'Host', type: 'string', default: '' },
        },
      },
    },
  },
};

const mockOrganizations = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'Default', type: 'organization' }],
};

const server = setupServer(
  http.options(
    ({ request }) => request.url.includes('/notification_templates/'),
    () => HttpResponse.json(mockNotificationTemplateOptions)
  ),
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({ actions: { GET: {}, POST: {} } })
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/') && !request.url.includes('/1/users/'),
    () => HttpResponse.json(mockOrganizations)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('NotifierForm', () => {
  describe('AddNotifier', () => {
    it('should render create notifier page with title', async () => {
      render(
        <MemoryRouter initialEntries={['/notifiers/create']}>
          <Routes>
            <Route path="/notifiers/create" element={<AddNotifier />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create notifier');
      });
    });

    it('should render Name form field', async () => {
      render(
        <MemoryRouter initialEntries={['/notifiers/create']}>
          <Routes>
            <Route path="/notifiers/create" element={<AddNotifier />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
      });
    });
  });
});
