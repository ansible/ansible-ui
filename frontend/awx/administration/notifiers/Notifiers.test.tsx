import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Notifiers } from './Notifiers';

const mockNotifiers = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'notification_template',
      name: 'csantiago_notification',
      description: '',
      organization: 1810,
      notification_type: 'email',
      notification_configuration: {
        host: '127.0.0.1',
        port: 10,
        sender: 'test@example.com',
        timeout: 30,
        use_ssl: false,
        use_tls: false,
        recipients: ['user@example.com'],
      },
      messages: null,
      summary_fields: {
        organization: { id: 1810, name: 'Default' },
        user_capabilities: { edit: true, delete: true, copy: true },
        recent_notifications: [],
      },
    },
  ],
};

const mockEmptyList = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const optionsWithPost = {
  actions: {
    GET: {},
    POST: { name: { type: 'string', required: true } },
  },
};

const optionsWithoutPost = {
  actions: {
    GET: {},
  },
};

const server = setupServer(
  http.options(awxAPI`/notification_templates/`, () => HttpResponse.json(optionsWithPost)),
  http.get(awxAPI`/notification_templates/`, () => HttpResponse.json(mockNotifiers))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderNotifiers = () =>
  render(
    <MemoryRouter>
      <Notifiers />
    </MemoryRouter>
  );

describe('Notifiers', () => {
  describe('Error list', () => {
    it('should display error when notifiers fail to load', async () => {
      server.use(
        http.get(awxAPI`/notification_templates/`, () => HttpResponse.json({}, { status: 500 }))
      );

      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('Error loading notifiers')).toBeInTheDocument();
      });
    });
  });

  describe('Non-empty list', () => {
    it('should render the Notifiers page with title', async () => {
      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Notifiers' })).toBeInTheDocument();
      });
    });

    it('should render page description', async () => {
      renderNotifiers();

      await waitFor(() => {
        expect(
          screen.getByText('Configure custom notifications to be sent based on predefined events.')
        ).toBeInTheDocument();
      });
    });

    it('should display notifiers in table', async () => {
      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('csantiago_notification')).toBeInTheDocument();
      });
    });

    it('should show Delete notifiers action in toolbar when items are selected', async () => {
      const user = userEvent.setup();
      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('csantiago_notification')).toBeInTheDocument();
      });

      const selectAllCheckbox = screen.getByRole('checkbox', {
        name: /select all/i,
      });
      await user.click(selectAllCheckbox);

      const toolbarActionsButton = screen.getByRole('button', {
        name: /toolbar actions/i,
      });
      await user.click(toolbarActionsButton);

      const deleteMenuItem = await screen.findByRole('menuitem', {
        name: /delete notifiers/i,
      });
      expect(deleteMenuItem).toBeInTheDocument();
    });
  });

  describe('RBAC', () => {
    it('should disable Create notifier button when user lacks permission', async () => {
      server.use(
        http.options(awxAPI`/notification_templates/`, () => HttpResponse.json(optionsWithoutPost))
      );

      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('csantiago_notification')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /create notifier/i,
      });
      expect(createButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable Create notifier button when user has permission', async () => {
      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('csantiago_notification')).toBeInTheDocument();
      });

      const createButton = screen.getByRole('button', {
        name: /create notifier/i,
      });
      expect(createButton).not.toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Empty list', () => {
    it('should display empty state with Create notifier button when user has permission', async () => {
      server.use(
        http.get(awxAPI`/notification_templates/`, () => HttpResponse.json(mockEmptyList))
      );

      renderNotifiers();

      await waitFor(() => {
        expect(screen.getByText('No notifiers found.')).toBeInTheDocument();
        expect(
          screen.getByText('Please create notifiers to populate this list.')
        ).toBeInTheDocument();
      });

      const createNotifier =
        screen.queryByRole('link', { name: /create notifier/i }) ??
        screen.queryByRole('button', { name: /create notifier/i });
      expect(createNotifier).toBeInTheDocument();
    });

    it('should display empty state with permission message when user lacks permission', async () => {
      server.use(
        http.get(awxAPI`/notification_templates/`, () => HttpResponse.json(mockEmptyList)),
        http.options(awxAPI`/notification_templates/`, () => HttpResponse.json(optionsWithoutPost))
      );

      renderNotifiers();

      await waitFor(() => {
        expect(
          screen.getByText('You do not have permission to create notifiers.')
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            'Please contact your organization administrator if there is an issue with your access.'
          )
        ).toBeInTheDocument();
      });

      expect(screen.queryByRole('link', { name: /create notifier/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /create notifier/i })).not.toBeInTheDocument();
    });
  });
});
