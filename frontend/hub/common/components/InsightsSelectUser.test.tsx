import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { InsightsSelectUser } from './InsightsSelectUser';

// Mock framework hooks
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => () => '/mock-url',
  };
});

const mockApiUsers = [{ username: 'alice' }, { username: 'bob' }, { username: 'charlie' }];

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/users'),
    () => {
      return HttpResponse.json({
        meta: { count: 3 },
        data: mockApiUsers,
        links: {},
      });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InsightsSelectUser', () => {
  const defaultProps = {
    assignedUsers: [] as { name?: string; username?: string }[],
    selectedUser: null,
    onSelectUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <InsightsSelectUser {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  describe('Empty State', () => {
    it('should show empty state when no users available', async () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/users'),
          () => {
            return HttpResponse.json({
              meta: { count: 0 },
              data: [],
              links: {},
            });
          }
        )
      );

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });
  });

  describe('User List Display', () => {
    it('should display users from API', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('bob')).toBeInTheDocument();
        expect(screen.getByText('charlie')).toBeInTheDocument();
      });
    });

    it('should show User column header', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
      });
    });
  });

  describe('Selected User Display', () => {
    it('should show selected user label when user is selected', () => {
      renderComponent({ selectedUser: { username: 'bob' } });

      expect(screen.getByText('Selected user')).toBeInTheDocument();
      // Check that the selected user is shown in the Label component
      expect(screen.getByText('bob', { selector: '.pf-v6-c-label__text' })).toBeInTheDocument();
    });
  });

  describe('Filtering Assigned Users', () => {
    it('should filter out already assigned users from the list', async () => {
      renderComponent({ assignedUsers: [{ username: 'bob' }] });

      await waitFor(() => {
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.getByText('charlie')).toBeInTheDocument();
      });

      // bob should be filtered out - check that bob's username is not in any table cell
      const cells = screen.queryAllByRole('cell');
      const bobCell = cells.find((cell) => cell.textContent === 'bob');
      expect(bobCell).toBeUndefined();
    });

    it('should show empty state when all users are already assigned', async () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/users'),
          () => {
            return HttpResponse.json({
              meta: { count: 1 },
              data: [{ username: 'alice' }],
              links: {},
            });
          }
        )
      );

      renderComponent({ assignedUsers: [{ username: 'alice' }] });

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      });
    });
  });

  describe('User Selection', () => {
    it('should call onSelectUser when a user is selected', async () => {
      const onSelectUser = vi.fn();
      renderComponent({ onSelectUser });

      await waitFor(() => {
        expect(screen.getByText('alice')).toBeInTheDocument();
      });

      // Click on the radio button for alice
      const radioButtons = screen.getAllByRole('radio');
      await userEvent.click(radioButtons[0]);

      expect(onSelectUser).toHaveBeenCalledWith({ username: 'alice' });
    });
  });
});
