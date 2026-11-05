import { usePageDialog } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxUser } from '../../../interfaces/User';
import { useSelectUsers } from './useSelectUsers';

vi.mock('@ansible/ansible-ui-framework', async () => ({
  ...(await vi.importActual('@ansible/ansible-ui-framework')),
  usePageDialog: vi.fn(),
}));
vi.mock('../../../common/useAwxView', () => ({
  useAwxView: vi.fn(() => ({ pageItems: [{ id: 1, username: 'admin' }], selectedItems: [] })),
}));
vi.mock('./useUsersColumns', () => ({ useUsersColumns: vi.fn(() => []) }));
vi.mock('./useUsersFilters', () => ({ useUsersFilters: vi.fn(() => []) }));
vi.mock('../../common/useUserAndTeamRolesLists', () => ({ useUserAndTeamRolesLists: vi.fn() }));

const server = setupServer(
  http.options(awxAPI`/users/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(awxAPI`/users/`, () =>
    HttpResponse.json({ count: 1, results: [{ id: 1, username: 'admin', type: 'user' }] })
  )
);
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useSelectUsers', () => {
  const setDialog = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePageDialog).mockReturnValue([null, setDialog]);
  });

  it('opens multi-select dialog with title and callback', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectUsers());
    result.current('Pick users', onSelect, 'Confirm', '/api/v2/custom/users/');
    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    expect(React.isValidElement(dialogElement)).toBe(true);
    if (!React.isValidElement(dialogElement)) throw new Error('expected dialog element');
    const props = dialogElement.props as {
      title: string;
      onSelect: (users: AwxUser[]) => void;
      accessUrl: string;
    };
    expect(props.title).toBe('Pick users');
    props.onSelect([{ id: 1 } as AwxUser]);
    expect(onSelect).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('renders user multi-select dialog content', async () => {
    const { result } = renderHook(() => useSelectUsers());
    result.current('Pick users', vi.fn());
    const dialogElement: unknown = setDialog.mock.calls[0]?.[0];
    if (!React.isValidElement(dialogElement)) throw new Error('expected dialog element');
    render(<MemoryRouter>{dialogElement}</MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pick users')).toBeInTheDocument());
  });
});
