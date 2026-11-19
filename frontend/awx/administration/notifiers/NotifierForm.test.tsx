import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { AddNotifier, EditNotifier, extractNotifierFieldMetadata } from './NotifierForm';

const pageNavigate = vi.hoisted(() => vi.fn());
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageNavigate: () => pageNavigate,
  };
});

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
afterEach(() => {
  server.resetHandlers();
  pageNavigate.mockClear();
  navigate.mockClear();
});
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

    it('should show pattern validation error and block submission when Host violates the OPTIONS metadata pattern', async () => {
      const user = userEvent.setup();
      const postSpy = vi.fn();

      // Register a POST handler to detect whether the form submits
      server.use(
        http.post(awxAPI`/notification_templates/`, () => {
          postSpy();
          return HttpResponse.json({ id: 1 }, { status: 201 });
        })
      );

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

      // Fill the required Name field so it doesn't block for a different reason
      await user.type(screen.getByTestId('name'), 'Test Email Notifier');

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

      // Click the real submit button — the form should refuse to POST
      await user.click(screen.getByTestId('Submit'));

      // The notifier-create API must NOT be called
      expect(postSpy).not.toHaveBeenCalled();
    }, 15000);
  });

  describe('extractNotifierFieldMetadata', () => {
    it('returns an empty map when options or the type are missing', () => {
      expect(extractNotifierFieldMetadata(undefined, 'email')).toEqual({});
      expect(
        extractNotifierFieldMetadata(
          { actions: { GET: { notification_configuration: {} } } },
          'missing'
        )
      ).toEqual({});
    });

    it('maps pattern metadata for the selected notification type', () => {
      const metadata = extractNotifierFieldMetadata(mockNotificationTemplateOptions, 'email');
      expect(metadata.host).toEqual(
        expect.objectContaining({
          pattern: '^[a-zA-Z0-9.-]+$',
          pattern_description: 'Host must be a valid hostname',
        })
      );
      expect(metadata.port?.pattern).toBe(String.raw`^\d+$`);
    });
  });

  describe('EditNotifier', () => {
    const emailTemplate = {
      id: 5,
      name: 'Mailer',
      description: 'Sends mail',
      notification_type: 'email',
      organization: 1,
      messages: null,
      notification_configuration: {
        username: 'mailer',
        password: 'secret',
        host: 'smtp.example.com',
        recipients: ['a@example.com', 'b@example.com'],
        sender: 'from@example.com',
        port: 25,
        timeout: 10,
        use_tls: false,
        use_ssl: true,
      },
    };

    function renderEdit(template: Record<string, unknown> = emailTemplate) {
      server.use(http.get(awxAPI`/notification_templates/5/`, () => HttpResponse.json(template)));
      return render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
    }

    it('shows a loading page while the notifier is loading', async () => {
      server.use(
        http.get(awxAPI`/notification_templates/5/`, async () => {
          await delay(200);
          return HttpResponse.json(emailTemplate);
        })
      );
      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Mailer')
      );
    });

    it('shows an error when the notifier request fails', async () => {
      server.use(
        http.get(awxAPI`/notification_templates/5/`, () => HttpResponse.json({}, { status: 500 }))
      );
      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => expect(screen.getByText('Internal Server Error')).toBeInTheDocument());
    });

    it('shows an error when notification options fail', async () => {
      server.use(
        http.options(
          ({ request }) => request.url.includes('/notification_templates/'),
          () => HttpResponse.json({}, { status: 500 })
        ),
        http.get(awxAPI`/notification_templates/5/`, () => HttpResponse.json(emailTemplate))
      );
      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      await waitFor(() => expect(screen.getByText('Internal Server Error')).toBeInTheDocument());
    });

    it('joins email recipient arrays into lines and uses the fallback title', async () => {
      renderEdit({ ...emailTemplate, name: '' });
      await waitFor(() =>
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit notifier')
      );
      expect(await screen.findByText('Recipient list')).toBeInTheDocument();
      expect(screen.getByTestId('notification-configuration-recipients')).toHaveValue(
        'a@example.com\nb@example.com'
      );
    });

    it.each([
      ['slack', 'channels', '#general\n#ops', 'Destination channels'],
      ['twilio', 'to_numbers', '+15550001\n+15550002', 'Destination SMS numbers'],
      ['grafana', 'annotation_tags', 'deploy\nalert', 'Tags for the annotation'],
      ['irc', 'targets', '#room\n#ops', 'Destination channels or users'],
    ])('joins %s list fields for editing', async (type, field, value, label) => {
      renderEdit({
        id: 5,
        name: `${type} notifier`,
        notification_type: type,
        organization: 1,
        messages: { error: { message: 'kept message' } },
        notification_configuration: { [field]: value.split('\n') },
      });
      await waitFor(() =>
        expect(screen.getByTestId('page-title')).toHaveTextContent(`Edit ${type} notifier`)
      );
      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(
        screen.getByTestId(`notification-configuration-${field.replaceAll('_', '-')}`)
      ).toHaveValue(value);
    });

    it('renders when the saved notifier has no configuration object', async () => {
      renderEdit({
        id: 5,
        name: 'Bare',
        notification_type: 'mattermost',
        organization: 1,
        messages: null,
      });
      await waitFor(() => expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Bare'));
      expect(screen.getByText('Type Details')).toBeInTheDocument();
    });
  });

  describe('submit', () => {
    it('patches an email notifier and splits list fields back into arrays', async () => {
      const user = userEvent.setup();
      let body: { messages?: unknown; notification_configuration?: { recipients?: string[] } } = {};
      server.use(
        http.get(awxAPI`/notification_templates/5/`, () =>
          HttpResponse.json({
            id: 5,
            name: 'Mailer',
            description: 'Sends mail',
            notification_type: 'email',
            organization: 1,
            messages: null,
            notification_configuration: {
              host: 'smtp.example.com',
              recipients: ['a@example.com', 'b@example.com'],
              sender: 'from@example.com',
              port: '25',
              timeout: 10,
            },
          })
        ),
        http.patch(awxAPI`/notification_templates/5/`, async ({ request }) => {
          body = (await request.json()) as typeof body;
          return HttpResponse.json({ id: 5 });
        })
      );

      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      expect(await screen.findByText('Recipient list')).toBeInTheDocument();
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () =>
          expect(pageNavigate).toHaveBeenCalledWith('awx-notification-template-details', {
            params: { id: 5 },
          }),
        { timeout: 10000 }
      );
      expect(body.messages).toBeNull();
      expect(body.notification_configuration?.recipients).toEqual([
        'a@example.com',
        'b@example.com',
      ]);
    }, 15000);

    it('shows a loading page until notification options arrive', async () => {
      server.use(
        http.options(
          ({ request }) => request.url.includes('/notification_templates/'),
          async () => {
            await delay(200);
            return HttpResponse.json(mockNotificationTemplateOptions);
          }
        )
      );
      render(
        <MemoryRouter initialEntries={['/notifiers/create']}>
          <Routes>
            <Route path="/notifiers/create" element={<AddNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      await waitFor(() =>
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create notifier')
      );
    });

    it('creates an email notifier and coerces empty, integer, and boolean fields', async () => {
      const user = userEvent.setup();
      let body: {
        id?: number;
        notification_configuration?: Record<string, unknown>;
      } = {};
      server.use(
        http.options(
          ({ request }) => request.url.includes('/notification_templates/'),
          () =>
            HttpResponse.json({
              actions: {
                GET: {
                  notification_configuration: {
                    email: {
                      username: { label: 'Username', type: 'string', default: '' },
                      use_tls: { label: 'Use TLS', type: 'bool', default: false },
                      port: { label: 'Port', type: 'int', default: 25 },
                      host: { label: 'Host', type: 'string', default: '' },
                    },
                  },
                },
              },
            })
        ),
        http.post(awxAPI`/notification_templates/`, async ({ request }) => {
          body = (await request.json()) as typeof body;
          return HttpResponse.json({ id: 42 }, { status: 201 });
        })
      );

      render(
        <MemoryRouter initialEntries={['/notifiers/create']}>
          <Routes>
            <Route path="/notifiers/create" element={<AddNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      await screen.findByTestId('page-title');
      await user.type(screen.getByTestId('name'), 'Created mailer');
      await user.click(screen.getByRole('button', { name: /Organization/i }));
      await user.click(await screen.findByRole('option', { name: 'Default' }));
      await user.click(screen.getByRole('button', { name: /Notification type/i }));
      await user.click(screen.getByRole('option', { name: 'Email' }));
      await screen.findByText('Host');
      await user.type(screen.getByTestId('notification-configuration-host'), 'smtp.example.com');
      await user.type(screen.getByTestId('notification-configuration-recipients'), 'a@example.com');
      await user.type(screen.getByTestId('notification-configuration-sender'), 'from@example.com');
      await user.type(screen.getByTestId('notification-configuration-port'), '25');
      await user.type(screen.getByTestId('notification-configuration-timeout'), '10');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () =>
          expect(pageNavigate).toHaveBeenCalledWith('awx-notification-template-details', {
            params: { id: 42 },
          }),
        { timeout: 10000 }
      );
      expect(body.notification_configuration?.username).toBe('');
      expect(body.notification_configuration?.use_tls).toBe(false);
      expect(body.notification_configuration?.port).toBe(25);
    }, 20000);

    it('defaults webhook headers and keeps custom messages', async () => {
      const user = userEvent.setup();
      let body: { messages?: unknown; notification_configuration?: { headers?: unknown } } = {};
      server.use(
        http.get(awxAPI`/notification_templates/5/`, () =>
          HttpResponse.json({
            id: 5,
            name: 'Hook',
            notification_type: 'webhook',
            organization: 1,
            messages: { error: { message: 'kept message' } },
            notification_configuration: {
              url: 'https://example.com/hook',
              http_method: 'POST',
            },
          })
        ),
        http.patch(awxAPI`/notification_templates/5/`, async ({ request }) => {
          body = (await request.json()) as typeof body;
          return HttpResponse.json({ id: 5 });
        })
      );

      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      expect(await screen.findByText('Target URL')).toBeInTheDocument();
      await user.click(screen.getByTestId('Submit'));
      await waitFor(() => expect(pageNavigate).toHaveBeenCalled());
      expect(body.notification_configuration?.headers).toEqual({});
      const messages = body.messages as { error?: { message?: string } } | undefined;
      expect(messages?.error?.message).toBe('kept message');
    }, 15000);

    it('shows message errors from a failed save and still cancels', async () => {
      const user = userEvent.setup();
      server.use(
        http.get(awxAPI`/notification_templates/5/`, () =>
          HttpResponse.json({
            id: 5,
            name: 'Mailer',
            notification_type: 'email',
            organization: 1,
            messages: null,
            notification_configuration: {
              host: 'smtp.example.com',
              recipients: 'a@example.com',
              sender: 'from@example.com',
              port: 25,
              timeout: 10,
            },
          })
        ),
        http.patch(awxAPI`/notification_templates/5/`, () =>
          HttpResponse.json({ messages: { started: ['invalid message'] } }, { status: 400 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/notifiers/5/edit']}>
          <Routes>
            <Route path="/notifiers/:id/edit" element={<EditNotifier />} />
          </Routes>
        </MemoryRouter>
      );
      expect(await screen.findByText('Recipient list')).toBeInTheDocument();
      await user.click(screen.getByTestId('Submit'));
      expect(await screen.findByText(/invalid message/)).toBeInTheDocument();
      expect(pageNavigate).not.toHaveBeenCalled();

      server.use(
        http.patch(awxAPI`/notification_templates/5/`, () =>
          HttpResponse.json({ detail: 'nope' }, { status: 500 })
        )
      );
      await user.click(screen.getByTestId('Submit'));
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(navigate).toHaveBeenCalledWith(-1);
    }, 15000);
  });
});
