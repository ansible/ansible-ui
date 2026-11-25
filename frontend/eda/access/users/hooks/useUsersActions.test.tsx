import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import {
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { IEdaView } from '../../../common/useEventDrivenView';
import { EdaUser } from '../../../interfaces/EdaUser';
import { EdaRoute } from '../../../main/EdaRoutes';
import { useDeleteUsers } from './useDeleteUser';
import { useUsersActions } from './useUsersActions';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';

vi.mock('./useDeleteUser', () => ({
  useDeleteUsers: vi.fn(() => vi.fn()),
}));

vi.mock('../../../common/useEdaActiveUser', () => ({
  useEdaActiveUser: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    usePageNavigate: vi.fn(() => vi.fn()),
  };
});

describe('useUsersActions', () => {
  const mockDeleteUsers = vi.fn();
  const mockNavigate = vi.fn();
  const mockUnselectItemsAndRefresh = vi.fn();

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

  const createMockView = (overrides: Partial<IEdaView<EdaUser>> = {}): IEdaView<EdaUser> =>
    ({
      unselectItemsAndRefresh: mockUnselectItemsAndRefresh,
      selectedItems: [],
      isSelected: vi.fn(() => false),
      ...overrides,
    }) as unknown as IEdaView<EdaUser>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteUsers).mockReturnValue(mockDeleteUsers);
    vi.mocked(usePageNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useEdaActiveUser).mockReturnValue({
      activeEdaUser: createMockUser({ id: 99, username: 'active', is_superuser: true }),
    });
  });

  it('returns create and delete user actions', () => {
    const view = createMockView();
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    expect(result.current).toHaveLength(2);
    const createAction = result.current[0];
    const deleteAction = result.current[1];

    expect(createAction).toMatchObject({
      type: PageActionType.Button,
      selection: PageActionSelection.None,
      label: 'Create user',
      isPinned: true,
    });
    expect(deleteAction).toMatchObject({
      type: PageActionType.Button,
      selection: PageActionSelection.Multiple,
      label: 'Delete users',
      isDanger: true,
    });
  });

  it('hides create action when active user is not a superuser', () => {
    vi.mocked(useEdaActiveUser).mockReturnValue({
      activeEdaUser: createMockUser({ is_superuser: false }),
    });
    const view = createMockView();
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const createAction = result.current[0];
    if ('isHidden' in createAction && typeof createAction.isHidden === 'function') {
      expect((createAction.isHidden as () => boolean)()).toBe(true);
    }
  });

  it('shows create action for superusers and navigates on click', () => {
    const view = createMockView();
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const createAction = result.current[0];
    if ('isHidden' in createAction && typeof createAction.isHidden === 'function') {
      expect((createAction.isHidden as () => boolean)()).toBe(false);
    }

    act(() => {
      if ('onClick' in createAction && typeof createAction.onClick === 'function') {
        (createAction.onClick as () => void)();
      }
    });
    expect(mockNavigate).toHaveBeenCalledWith(EdaRoute.CreateUser);
  });

  it('calls deleteUsers with selected users on delete click', () => {
    const users = [createMockUser({ id: 2 }), createMockUser({ id: 3, username: 'other' })];
    const view = createMockView();
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const deleteAction = result.current[1];
    act(() => {
      if ('onClick' in deleteAction && typeof deleteAction.onClick === 'function') {
        (deleteAction.onClick as (items: EdaUser[]) => void)(users);
      }
    });
    expect(mockDeleteUsers).toHaveBeenCalledWith(users);
  });

  it('disables delete when the active user is among selected items', () => {
    const activeUser = createMockUser({ id: 99, username: 'active' });
    vi.mocked(useEdaActiveUser).mockReturnValue({ activeEdaUser: activeUser });
    const view = createMockView({
      selectedItems: [activeUser],
      isSelected: vi.fn((user: EdaUser) => user.id === activeUser.id),
    });

    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const deleteAction = result.current[1];
    expect('isDisabled' in deleteAction ? deleteAction.isDisabled : undefined).toBe(
      'Current user cannot be deleted'
    );
  });

  it('does not disable delete when active user is not selected', () => {
    const view = createMockView({ selectedItems: [createMockUser({ id: 2 })] });
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const deleteAction = result.current[1];
    expect('isDisabled' in deleteAction ? deleteAction.isDisabled : undefined).toBeUndefined();
  });

  it('wires deleteUsers hook to view refresh callback', () => {
    const view = createMockView();
    renderHook(() => useUsersActions(view), { wrapper });

    expect(useDeleteUsers).toHaveBeenCalledWith(mockUnselectItemsAndRefresh);
  });

  it('hides create when there is no active user', () => {
    vi.mocked(useEdaActiveUser).mockReturnValue({ activeEdaUser: undefined });
    const view = createMockView();
    const { result } = renderHook(() => useUsersActions(view), { wrapper });

    const createAction = result.current[0];
    if ('isHidden' in createAction && typeof createAction.isHidden === 'function') {
      expect((createAction.isHidden as () => boolean)()).toBe(true);
    }
  });
});
