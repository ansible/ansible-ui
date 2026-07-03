/* eslint-disable i18next/no-literal-string */
import { renderHook, act, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { useDeleteEdaRoles } from './useDeleteEdaRoles';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { PageDialogProvider } from '../../../../../framework/PageDialogs/PageDialog';
import { FrameworkTranslationsProvider } from '../../../../../framework/useFrameworkTranslations';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { edaAPI } from '../../../common/eda-utils';
import { BrowserRouter } from 'react-router-dom';
import { EdaActiveUserContext } from '../../../common/useEdaActiveUser';

vi.mock('./useRoleColumns', () => ({
  useRoleColumns: vi.fn(() => [
    {
      header: 'Name',
      type: 'text',
      value: (item: EdaRbacRole) => item.name,
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

const mockActiveUser = {
  id: 1,
  username: 'admin',
  is_superuser: true,
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

describe('useDeleteEdaRoles', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    onComplete.mockClear();
  });
  afterAll(() => server.close());

  const onComplete = vi.fn();
  const roles: EdaRbacRole[] = [
    {
      id: 1,
      name: 'Custom Role',
      description: 'A custom role',
      managed: false,
      content_type: 'eda.project',
      permissions: ['view_project'],
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      summary_fields: {},
    } as unknown as EdaRbacRole,
  ];

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <EdaActiveUserContext.Provider
        value={{ activeEdaUser: mockActiveUser, refreshActiveEdaUser: () => {} }}
      >
        <PageDialogProvider>
          <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
        </PageDialogProvider>
      </EdaActiveUserContext.Provider>
    </BrowserRouter>
  );

  it('should open bulk action dialog with role names', () => {
    const { result } = renderHook(() => useDeleteEdaRoles(onComplete), { wrapper });
    act(() => {
      result.current(roles);
    });

    expect(screen.getByText('Permanently delete roles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete roles' })).toBeInTheDocument();
  });

  it('should call actionFn on confirm', async () => {
    const user = userEvent.setup();
    server.use(
      http.delete(edaAPI`/role_definitions/1/`, () => {
        return HttpResponse.json({});
      })
    );

    const { result } = renderHook(() => useDeleteEdaRoles(onComplete), { wrapper });
    act(() => {
      result.current(roles);
    });

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    const submitButton = screen.getByRole('button', { name: 'Delete roles' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should show alert when built-in roles are selected', () => {
    const managedRoles: EdaRbacRole[] = [
      {
        id: 2,
        name: 'Built-in Admin',
        description: 'Built-in role',
        managed: true,
        content_type: 'eda.project',
        permissions: ['*'],
        created: '2024-01-01T00:00:00Z',
        modified: '2024-01-01T00:00:00Z',
        summary_fields: {},
      } as unknown as EdaRbacRole,
    ];

    const { result } = renderHook(() => useDeleteEdaRoles(onComplete), { wrapper });
    act(() => {
      result.current(managedRoles);
    });

    expect(
      screen.getByText('1 of the selected roles cannot be deleted because they are built-in.')
    ).toBeInTheDocument();
  });

  it('should show alert for non-superuser without permission', () => {
    const nonSuperuserWrapper = ({ children }: { children: React.ReactNode }) => (
      <BrowserRouter>
        <EdaActiveUserContext.Provider
          value={{
            activeEdaUser: { ...mockActiveUser, is_superuser: false },
            refreshActiveEdaUser: () => {},
          }}
        >
          <PageDialogProvider>
            <FrameworkTranslationsProvider>{children}</FrameworkTranslationsProvider>
          </PageDialogProvider>
        </EdaActiveUserContext.Provider>
      </BrowserRouter>
    );

    const { result } = renderHook(() => useDeleteEdaRoles(onComplete), {
      wrapper: nonSuperuserWrapper,
    });
    act(() => {
      result.current(roles);
    });

    expect(
      screen.getByText('1 of the selected roles cannot be deleted due to insufficient permissions.')
    ).toBeInTheDocument();
  });
});
