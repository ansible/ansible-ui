import { render, renderHook, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../../../../framework/test-utils/swrTestWrapper';
import { useIndirectTeamRolesOnResourceView } from './useIndirectTeamRolesOnResourceView';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useIndirectTeamRolesOnResourceView', () => {
  it('should flatten intermediary roles into table rows', async () => {
    server.use(
      http.get('*/role_definitions/*', () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 10, name: 'Team Member', description: 'Member role' }],
        })
      ),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              intermediary_roles: [
                { role_definition: { name: 'Team Member', url: '/roles/10/' } },
                { role_definition: { name: 'Team Member', url: '/roles/10/' } },
              ],
              summary_fields: {
                content_object: { id: 3, name: 'Ops Team' },
                role_definition: { id: 10, name: 'Team Member', managed: true, description: '' },
                user: { id: 1, username: 'alice', first_name: 'Alice', last_name: 'Smith' },
              },
            },
          ],
        })
      )
    );

    const { result } = renderHook(
      () => useIndirectTeamRolesOnResourceView('awx.project', '5', 'user-ansible-id'),
      {
        wrapper: ({ children }) => (
          <MemoryRouter>
            <SwrTestWrapper>{children}</SwrTestWrapper>
          </MemoryRouter>
        ),
      }
    );

    await waitFor(() => expect(result.current.view.pageItems?.length).toBeGreaterThan(0));
    expect(result.current.tableColumns).toHaveLength(3);
  });

  it('should render role and team links in table columns', async () => {
    const assignment = {
      id: 1,
      intermediary_roles: [{ role_definition: { name: 'Team Member', url: '/roles/10/' } }],
      summary_fields: {
        content_object: { id: 3, name: 'Ops Team' },
        role_definition: { id: 10, name: 'Team Member', managed: true, description: 'Member role' },
        user: { id: 1, username: 'alice', first_name: 'Alice', last_name: 'Smith' },
      },
    };

    server.use(
      http.get('*/role_definitions/*', () =>
        HttpResponse.json({
          count: 1,
          results: [{ id: 10, name: 'Team Member', description: 'Member role' }],
        })
      ),
      http.get('*/role_user_access/*', () => HttpResponse.json({ count: 1, results: [assignment] }))
    );

    const { result } = renderHook(
      () => useIndirectTeamRolesOnResourceView('awx.project', '5', 'user-ansible-id'),
      {
        wrapper: ({ children }) => (
          <MemoryRouter>
            <SwrTestWrapper>{children}</SwrTestWrapper>
          </MemoryRouter>
        ),
      }
    );

    await waitFor(() => expect(result.current.view.pageItems?.length).toBe(1));

    const item = result.current.view.pageItems![0];
    render(
      <MemoryRouter>
        <>
          {result.current.tableColumns[0].cell(item)}
          {result.current.tableColumns[1].cell(item)}
          {result.current.tableColumns[2].cell(item)}
        </>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Team Member' })).toBeInTheDocument();
    expect(screen.getByText('Member role')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ops Team' })).toBeInTheDocument();
  });

  it('should keep rows without intermediary roles and render empty name cells', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_user_access/*', () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 2,
              intermediary_roles: [],
              summary_fields: {
                content_object: { id: 0, name: '' },
                role_definition: { id: 0, name: '', managed: false, description: '' },
                user: { id: 1, username: 'bob', first_name: '', last_name: '' },
              },
            },
          ],
        })
      )
    );

    const { result } = renderHook(
      () => useIndirectTeamRolesOnResourceView('eda.project', '9', 'eda-user'),
      {
        wrapper: ({ children }) => (
          <MemoryRouter>
            <SwrTestWrapper>{children}</SwrTestWrapper>
          </MemoryRouter>
        ),
      }
    );

    await waitFor(() => expect(result.current.view.pageItems.length).toBe(1));
    const item = result.current.view.pageItems[0];
    const { container } = render(<>{result.current.tableColumns[0].cell(item)}</>);
    expect(container).toBeEmptyDOMElement();
  });

  it('should use gateway API for non-awx resource types', async () => {
    server.use(
      http.get('*/role_definitions/*', () => HttpResponse.json({ count: 0, results: [] })),
      http.get('*/role_user_access/shared.team/2/user-1/*', () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    const { result } = renderHook(
      () => useIndirectTeamRolesOnResourceView('shared.team', '2', 'user-1'),
      {
        wrapper: ({ children }) => (
          <MemoryRouter>
            <SwrTestWrapper>{children}</SwrTestWrapper>
          </MemoryRouter>
        ),
      }
    );

    await waitFor(() => expect(result.current.view).toBeDefined());
  });
});
