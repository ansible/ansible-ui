/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { EdaUser } from '../../../interfaces/EdaUser';
import { useDeleteUsers } from './useDeleteUser';

vi.mock('./useUserColumns', () => ({
  useUserColumns: vi.fn(() => [
    {
      header: 'Username',
      type: 'text',
      value: (item: EdaUser) => item.username,
      modal: 'visible',
    },
  ]),
}));

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    ),
  };
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useDeleteUsers', () => {
  const createMockUser = (overrides: Partial<EdaUser> = {}): EdaUser =>
    ({
      id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      is_superuser: false,
      created_at: '2024-01-01T00:00:00Z',
      modified_at: '2024-01-01T00:00:00Z',
      resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
      ...overrides,
    }) as EdaUser;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <PageDialogProvider>
        <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
      </PageDialogProvider>
    </BrowserRouter>
  );

  it('should open confirmation dialog with delete text', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });
    const users = [createMockUser({ id: 1, username: 'user1' })];

    act(() => {
      result.current(users);
    });

    expect(screen.getByText('Permanently delete users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete users' })).toBeInTheDocument();
  });

  it.skip('should call onComplete after confirming deletion', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    server.use(http.delete('*/users/1/', () => HttpResponse.json({})));

    const { result } = renderHook(() => useDeleteUsers(onComplete), { wrapper });
    const users = [createMockUser({ id: 1, username: 'user1' })];

    act(() => {
      result.current(users);
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const submitButton = screen.getByRole('button', { name: 'Delete users' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
