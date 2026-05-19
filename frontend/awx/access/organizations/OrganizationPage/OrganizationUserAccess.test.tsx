import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { OrganizationUserAccess } from './OrganizationUserAccess';

// Mock the bulk confirmation hook to capture its configuration
const mockBulkAction = vi.fn();
vi.mock('../../../common/useAwxBulkConfirmation', () => ({
  useAwxBulkConfirmation: () => mockBulkAction,
}));

const server = setupServer(
  http.get(/role_user_assignments/, () =>
    HttpResponse.json({ count: 0, results: [], next: null, previous: null })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

describe('OrganizationUserAccess', () => {
  it('should render user access with Username or Assign users', { timeout: 10000 }, async () => {
    render(
      <MemoryRouter initialEntries={['/organizations/1/user-access']}>
        <Routes>
          <Route path="/organizations/:id/user-access" element={<OrganizationUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(
      () => {
        const el = screen.queryByText('Username') ?? screen.queryByText('Assign users');
        expect(el).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
  });

  it('should render removal modal with correct warning content', { timeout: 10000 }, async () => {
    const user = userEvent.setup();

    // Mock API responses for user assignments
    server.use(
      http.get(/role_user_assignments/, () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              summary_fields: {
                user: { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User' },
                role_definition: { id: 1, name: 'Organization Member' },
              },
            },
          ],
          next: null,
          previous: null,
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/organizations/1/user-access']}>
        <Routes>
          <Route path="/organizations/:id/user-access" element={<OrganizationUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the user to appear in the list
    await waitFor(
      () => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    // Find and click the row action button to trigger removal
    const rowActionButton = screen.getByLabelText('Actions');
    await user.click(rowActionButton);

    // Click the "Remove role" option
    const removeButton = await screen.findByText('Remove role');
    await user.click(removeButton);

    // Verify the bulk confirmation hook was called with correct parameters
    expect(mockBulkAction).toHaveBeenCalledOnce();
    const callArgs = mockBulkAction.mock.calls[0][0] as {
      title: string;
      confirmText: string;
      actionButtonText: string;
      isDanger: boolean;
      items: Array<{
        id: number;
        summary_fields: {
          user: { id: number; username: string; first_name: string; last_name: string };
          role_definition: { id: number; name: string };
        };
      }>;
    };

    // Verify modal title
    expect(callArgs.title).toBe('Remove role');

    // Verify confirmation text (warning message)
    expect(callArgs.confirmText).toBe('Yes, I confirm that I want to remove these 1 roles.');

    // Verify action button text
    expect(callArgs.actionButtonText).toBe('Remove role');

    // Verify it's marked as a dangerous action (red button)
    expect(callArgs.isDanger).toBe(true);

    // Verify the items to be removed
    expect(callArgs.items).toHaveLength(1);
    expect(callArgs.items[0].summary_fields.user.username).toBe('testuser');
  });
});
