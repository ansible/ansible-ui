import type { ReactNode } from 'react';
import { render, renderHook, screen, waitFor } from '@testing-library/react';
import type { ITableColumn } from '@ansible/ansible-ui-framework';
import type { TeamAssignment } from '@ansible/common-ui/access/interfaces/TeamAssignment';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SwrTestWrapper } from '../../../../../framework/test-utils/swrTestWrapper';
import { useIndirectTeamRolesView } from './useIndirectTeamRolesView';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderInheritedFromCell(
  column: ITableColumn<TeamAssignment> & { cell: (resource: TeamAssignment) => ReactNode },
  item: TeamAssignment
) {
  return column.cell(item);
}

describe('useIndirectTeamRolesView', () => {
  it('should load team role assignments for user teams', async () => {
    server.use(
      http.get('*/users/42/teams/*', () =>
        HttpResponse.json({ results: [{ id: 7, name: 'Ops' }] })
      ),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 1,
              summary_fields: {
                team: { id: 7, name: 'Ops' },
                role_definition: { id: 2, name: 'Member', description: '', managed: true },
              },
            },
          ],
        })
      )
    );

    const { result } = renderHook(() => useIndirectTeamRolesView('42'), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <SwrTestWrapper>{children}</SwrTestWrapper>
        </MemoryRouter>
      ),
    });

    await waitFor(() => expect(result.current.view.pageItems?.length).toBeGreaterThan(0));
    expect(result.current.tableColumns.length).toBeGreaterThan(1);

    const item = result.current.view.pageItems![0];
    const inheritedColumn = result.current.tableColumns.at(-1) as ITableColumn<TeamAssignment> & {
      cell: (resource: TeamAssignment) => ReactNode;
    };
    render(<MemoryRouter>{renderInheritedFromCell(inheritedColumn, item)}</MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Ops' })).toBeInTheDocument();
  });

  it('should render empty inherited-from cell when team name is missing', async () => {
    server.use(
      http.get('*/users/42/teams/*', () =>
        HttpResponse.json({ results: [{ id: 7, name: 'Ops' }] })
      ),
      http.get('*/role_team_assignments/*', () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              id: 2,
              summary_fields: {
                team: { id: 0, name: '' },
                role_definition: { id: 2, name: 'Member', description: '', managed: true },
              },
            },
          ],
        })
      )
    );

    const { result } = renderHook(() => useIndirectTeamRolesView('42'), {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <SwrTestWrapper>{children}</SwrTestWrapper>
        </MemoryRouter>
      ),
    });

    await waitFor(() => expect(result.current.view.pageItems?.length).toBe(1));
    const inheritedColumn = result.current.tableColumns.at(-1) as ITableColumn<TeamAssignment> & {
      cell: (resource: TeamAssignment) => ReactNode;
    };
    const assignment = result.current.view.pageItems![0];
    const { container } = render(<>{renderInheritedFromCell(inheritedColumn, assignment)}</>);
    expect(container).toBeEmptyDOMElement();
  });
});
