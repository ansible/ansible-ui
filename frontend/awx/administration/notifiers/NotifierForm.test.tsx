import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
          host: {
            label: 'Host',
            type: 'string',
            default: '',
            pattern: '^[a-zA-Z0-9.-]+$',
            pattern_description: 'Host must be a valid hostname',
          },
          port: {
            label: 'Port',
            type: 'int',
            default: 25,
            pattern: String.raw`^\d+$`,
            pattern_description: 'Port must be numeric',
          },
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

    it('should render the type details section when a notification type is selected', async () => {
      const user = userEvent.setup();

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

      // Select Email notification type
      await user.click(screen.getByRole('button', { name: /Notification type/i }));
      await user.click(screen.getByRole('option', { name: 'Email' }));

      // Verify the Type Details section renders with email-specific fields
      await waitFor(
        () => {
          expect(screen.getByText('Type Details')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
      expect(screen.getByText('Host')).toBeInTheDocument();
    });

    it('should show pattern validation error when Host violates the OPTIONS metadata pattern', async () => {
      const user = userEvent.setup();

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

      // Select Email notification type to render the dynamic sub-form
      await user.click(screen.getByRole('button', { name: /Notification type/i }));
      await user.click(screen.getByRole('option', { name: 'Email' }));

      // Wait for the Host field to render (the sub-form is loaded after type selection)
      await waitFor(
        () => {
          expect(screen.getByText('Type Details')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Type an invalid hostname that violates the pattern '^[a-zA-Z0-9.-]+$'
      // from the MSW mock OPTIONS response
      const hostInput = screen.getByTestId('notification-configuration-host');
      await user.type(hostInput, 'bad host!@#');
      await user.tab();

      // The pattern_description from the OPTIONS metadata should surface as a
      // validation error, proving the full pipeline:
      // OPTIONS → extractNotifierFieldMetadata → buildFieldMetadataMap →
      // PageFormFieldMetadataProvider → usePageFormOptionsContext →
      // createFieldValidate → Controller blocks submission
      await waitFor(() => {
        expect(screen.getByText('Host must be a valid hostname')).toBeInTheDocument();
      });
    });
  });
});
