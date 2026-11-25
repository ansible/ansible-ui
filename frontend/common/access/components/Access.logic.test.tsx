import {
  ColumnPriority,
  ToolbarFilterType,
  type ITableColumn,
  type IToolbarFilter,
} from '@ansible/ansible-ui-framework';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Assignment } from '../interfaces/Assignment';
import { Access } from './Access';

const bulk = vi.hoisted(() => ({
  awx: vi.fn(),
  eda: vi.fn(),
  hub: vi.fn(),
}));
const unselectItemsAndRefresh = vi.hoisted(() => vi.fn());
const tableProps = vi.hoisted(() => ({
  current: undefined as
    | {
        id?: string;
        emptyStateTitle?: string;
        emptyStateDescription?: string;
        toolbarFilters?: { key: string }[];
        rowActions?: { label: string; onClick: (item: Assignment) => void }[];
        toolbarActions?: {
          label: string;
          href?: string;
          onClick?: (items: Assignment[]) => void;
        }[];
        tableColumns?: ITableColumn<Assignment>[];
      }
    | undefined,
}));

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageTable: (props: NonNullable<(typeof tableProps)['current']>) => {
      tableProps.current = props;
      return <div data-testid="access-table" />;
    },
  };
});

vi.mock('@ansible/eda-ui/common/useEventDrivenView', () => ({
  useEdaView: () => ({
    pageItems: [],
    itemCount: 0,
    unselectItemsAndRefresh,
  }),
}));

vi.mock('@ansible/awx-ui/common/useAwxBulkConfirmation', () => ({
  useAwxBulkConfirmation: () => bulk.awx,
}));

vi.mock('@ansible/eda-ui/common/useEdaBulkConfirmation', () => ({
  useEdaBulkConfirmation: () => bulk.eda,
}));

vi.mock('@ansible/hub-ui/common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => bulk.hub,
}));

const item = {
  id: 10,
  summary_fields: {
    object_role: { id: 1 },
    role_definition: { id: 2, name: 'Admin', description: '', managed: true },
    content_object: { name: 'Project', id: 5 },
  },
  object_id: '5',
  content_type: 'project',
  role_definition: 2,
} as Assignment;

const server = setupServer(
  http.delete('*/assignments/10/', () => new HttpResponse(null, { status: 204 }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
beforeEach(() => {
  bulk.awx.mockClear();
  bulk.eda.mockClear();
  bulk.hub.mockClear();
  tableProps.current = undefined;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderAccess(
  props: Partial<React.ComponentProps<typeof Access<Assignment>>> & {
    service?: 'awx' | 'eda' | 'hub';
  } = {}
) {
  const service = props.service ?? 'awx';
  return render(
    <MemoryRouter initialEntries={['/resources/5/access']}>
      <Routes>
        <Route
          path="/resources/:id/access"
          element={
            <Access<Assignment>
              service={service}
              id="5"
              url="/api/access/assignments/"
              accessListType="user"
              tableColumnFunctions={{
                name: {
                  label: 'Username',
                  sort: 'user__username',
                  function: () => 'alice',
                  to: () => '/users/2',
                },
              }}
              {...props}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Access actions and empty states', () => {
  it('removes roles through the service-specific bulk action and deletes the assignment', async () => {
    renderAccess({
      service: 'awx',
      content_type_model: 'project',
      accessListType: 'user',
      toolbarNameColumnFiltersValues: { label: 'Username', query: 'user__username' },
      additionalTableFilters: [
        {
          key: 'extra',
          label: 'Extra',
          type: ToolbarFilterType.SingleText,
          query: 'extra',
          comparison: 'contains',
        } as IToolbarFilter,
      ],
      additionalTableColumns: [
        { header: 'First extra', type: 'text', value: () => 'first' },
        {
          header: 'Last extra',
          type: 'text',
          value: () => 'last',
          priority: ColumnPriority.last,
        },
      ],
      removeRoleText: 'Revoke access',
    });

    expect(screen.getByTestId('access-table')).toBeInTheDocument();
    expect(tableProps.current?.id).toBe('awx-project-access-table');
    expect(tableProps.current?.toolbarFilters?.map((filter) => filter.key)).toEqual([
      'name',
      'role_definition__name',
      'extra',
    ]);
    expect(tableProps.current?.emptyStateTitle).toBe('No users assigned to project');
    expect(tableProps.current?.emptyStateDescription).toBe(
      'To get started, assign users to this project.'
    );
    const nameColumn = tableProps.current?.tableColumns?.[0] as
      | {
          value?: (row: Assignment) => string;
          to?: (row: Assignment) => string | undefined;
        }
      | undefined;
    const roleColumn = tableProps.current?.tableColumns?.[2] as
      | { value?: (row: Assignment) => string }
      | undefined;
    expect(nameColumn?.value?.(item)).toBe('alice');
    expect(nameColumn?.to?.(item)).toBe('/users/2');
    expect(roleColumn?.value?.(item)).toBe('Admin');

    tableProps.current?.rowActions?.[0].onClick(item);
    expect(bulk.awx).toHaveBeenCalled();
    const config = bulk.awx.mock.calls[0][0] as {
      title: string;
      confirmText: string;
      actionFn: (row: Assignment, signal: AbortSignal) => Promise<unknown>;
      onComplete: (rows: Assignment[]) => void;
    };
    expect(config.title).toBe('Revoke access');
    expect(config.confirmText).toContain('roles');
    expect(config.onComplete).toBe(unselectItemsAndRefresh);
    await config.actionFn(item, new AbortController().signal);

    tableProps.current?.toolbarActions?.[1].onClick?.([item]);
    expect(bulk.awx).toHaveBeenCalledTimes(2);
  });

  it('uses team confirmation copy and the eda and hub bulk actions', () => {
    renderAccess({
      service: 'eda',
      content_type_model: 'team',
      accessListType: 'team',
      removeConfirmationText: (count) => `Remove ${count} memberships`,
    });
    tableProps.current?.rowActions?.[0].onClick(item);
    const edaConfig = bulk.eda.mock.calls[0][0] as { confirmText: string };
    expect(edaConfig.confirmText).toBe('Remove 1 memberships');
    expect(tableProps.current?.emptyStateTitle).toBe('No teams are assigned to this team.');
    expect(tableProps.current?.emptyStateDescription).toBe(
      'To get started, assign a team to this team.'
    );

    renderAccess({ service: 'hub', accessListType: 'team', id: '5' });
    tableProps.current?.rowActions?.[0].onClick(item);
    expect(bulk.hub).toHaveBeenCalled();
    expect(tableProps.current?.emptyStateTitle).toBe('No teams are assigned to this resource.');
    expect(tableProps.current?.emptyStateDescription).toBe(
      'To get started, assign a team to this resource.'
    );
    expect(tableProps.current?.id).toBe('hub-team-table');
  });

  it('builds empty states for user roles, team roles, and unknown list types', () => {
    renderAccess({ service: 'awx', accessListType: 'user-roles' });
    expect(tableProps.current?.emptyStateTitle).toMatch(/Automation Execution roles/);
    expect(tableProps.current?.emptyStateDescription).toBe(
      'Add a role by clicking the button below.'
    );
    expect(tableProps.current?.toolbarFilters?.some((filter) => filter.key === 'name')).toBe(false);

    renderAccess({ service: 'eda', accessListType: 'user-roles' });
    expect(tableProps.current?.emptyStateTitle).toMatch(/Automation Decisions roles/);

    renderAccess({ service: 'hub', accessListType: 'user-roles' });
    expect(tableProps.current?.emptyStateTitle).toMatch(/Automation Content roles/);

    renderAccess({ service: 'other' as 'awx', accessListType: 'user-roles' });
    expect(tableProps.current?.emptyStateTitle).toBe(
      'There are currently no roles assigned to this user.'
    );

    renderAccess({ service: 'hub', accessListType: 'team-roles' });
    expect(tableProps.current?.emptyStateTitle).toBe(
      'There are currently no roles assigned to this team.'
    );

    renderAccess({
      service: 'awx',
      accessListType: 'other' as 'user',
      content_type_model: undefined,
    });
    expect(tableProps.current?.emptyStateTitle).toBe(
      'There are currently no roles assigned to this resource.'
    );
    expect(tableProps.current?.emptyStateDescription).toBe(
      'Add a role by clicking the button below.'
    );

    renderAccess({ service: 'awx', accessListType: 'user' });
    expect(tableProps.current?.emptyStateTitle).toBe('No users assigned to this resource');
    expect(tableProps.current?.toolbarActions?.[0].label).toBe('Add roles');
  });

  it('confirms team membership removal with the default user copy', () => {
    renderAccess({ service: 'awx', content_type_model: 'team', accessListType: 'user' });
    tableProps.current?.rowActions?.[0].onClick(item);
    const awxConfig = bulk.awx.mock.calls.at(-1)?.[0] as { confirmText: string; title: string };
    expect(awxConfig.confirmText).toContain('users');
    expect(awxConfig.title).toBe('Remove role');
  });
});
