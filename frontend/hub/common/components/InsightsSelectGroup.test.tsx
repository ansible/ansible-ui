import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { InsightsSelectGroup } from './InsightsSelectGroup';

// Mock framework hooks
vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => vi.fn(),
    useGetPageUrl: () => () => '/mock-url',
  };
});

const mockGroups = [
  { id: 1, name: 'admins', pulp_href: '/api/groups/1/' },
  { id: 2, name: 'editors', pulp_href: '/api/groups/2/' },
  { id: 3, name: 'viewers', pulp_href: '/api/groups/3/' },
];

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/groups'),
    () => {
      return HttpResponse.json({
        meta: { count: 3 },
        data: mockGroups,
        links: {},
      });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('InsightsSelectGroup', () => {
  const defaultProps = {
    assignedGroups: [] as { name: string }[],
    selectedGroup: null,
    onSelectGroup: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      // Fresh SWRConfig per test prevents cache from previous tests polluting responses
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <InsightsSelectGroup {...defaultProps} {...props} />
        </MemoryRouter>
      </SWRConfig>
    );
  };

  describe('Empty State', () => {
    it('should show empty state when no groups available', async () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/groups'),
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
        expect(screen.getByText('No groups found')).toBeInTheDocument();
      });
    });
  });

  describe('Group List Display', () => {
    it('should display groups from API', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('admins')).toBeInTheDocument();
        expect(screen.getByText('editors')).toBeInTheDocument();
        expect(screen.getByText('viewers')).toBeInTheDocument();
      });
    });

    it('should show Group column header', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Group')).toBeInTheDocument();
      });
    });
  });

  describe('Selected Group Display', () => {
    it('should show selected group label when group is selected', () => {
      renderComponent({ selectedGroup: { id: 2, name: 'editors' } });

      expect(screen.getByText('Selected group')).toBeInTheDocument();
      // Check that the selected group is shown in the Label component
      expect(screen.getByText('editors', { selector: '.pf-v6-c-label__text' })).toBeInTheDocument();
    });
  });

  describe('Filtering Assigned Groups', () => {
    it('should filter out already assigned groups from the list', async () => {
      renderComponent({ assignedGroups: [{ name: 'editors' }] });

      await waitFor(() => {
        expect(screen.getByText('admins')).toBeInTheDocument();
        expect(screen.getByText('viewers')).toBeInTheDocument();
      });

      // editors should be filtered out - check that editors is not in any table cell
      const cells = screen.queryAllByRole('cell');
      const editorsCell = cells.find((cell) => cell.textContent === 'editors');
      expect(editorsCell).toBeUndefined();
    });

    it('should show empty state when all groups are already assigned', async () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/groups'),
          () => {
            return HttpResponse.json({
              meta: { count: 1 },
              data: [{ id: 1, name: 'admins', pulp_href: '/api/groups/1/' }],
              links: {},
            });
          }
        )
      );

      renderComponent({ assignedGroups: [{ name: 'admins' }] });

      // Wait for data to load, filtering to complete, and empty state to appear.
      // All assertions must be inside waitFor so retries continue until the
      // empty state renders — checking outside would race against the loading state.
      await waitFor(
        () => {
          const cells = screen.queryAllByRole('cell');
          const adminsCell = cells.find((cell) => cell.textContent === 'admins');
          expect(adminsCell).toBeUndefined();

          const emptyStateTitle = screen.queryByText('No groups found');
          const emptyStateDescription = screen.queryByText(
            'No groups match the current filter criteria.'
          );
          expect(emptyStateTitle || emptyStateDescription).toBeTruthy();
        },
        { timeout: 5000 }
      );
    });
  });

  describe('Group Selection', () => {
    it('should call onSelectGroup when a group is selected', async () => {
      const onSelectGroup = vi.fn();
      renderComponent({ onSelectGroup });

      await waitFor(() => {
        expect(screen.getByText('admins')).toBeInTheDocument();
      });

      // Click on the radio button for admins
      const radioButtons = screen.getAllByRole('radio');
      await userEvent.click(radioButtons[0]);

      expect(onSelectGroup).toHaveBeenCalled();
      expect(onSelectGroup.mock.calls[0][0]).toHaveProperty('name');
    });
  });
});
