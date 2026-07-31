/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ManageOrgRoles } from './useManageOrgRolesDialog';
import type { OrgRolesListProps } from '../components/OrgRolesList';

vi.mock('@patternfly/react-core', async () => {
  const actual =
    await vi.importActual<typeof import('@patternfly/react-core')>('@patternfly/react-core');
  return {
    ...actual,
    Modal: ({
      isOpen,
      children,
    }: {
      isOpen: boolean;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (isOpen ? <div data-testid="mock-modal">{children}</div> : null),
    ModalHeader: ({ title }: { title: string; [key: string]: unknown }) => <div>{title}</div>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalVariant: { medium: 'medium' },
  };
});

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    usePageDialog: () => [undefined, vi.fn()],
  };
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockOrgListProps: OrgRolesListProps = {
  title: 'Automation controller roles',
  isExpandable: true,
  apiPrefixFunction: (strings: TemplateStringsArray, ...values: string[]) => {
    let result = '/api/controller/v2';
    strings.forEach((str, i) => {
      result += str + (values[i] || '');
    });
    return result;
  },
  orgId: '1',
  userId: '1',
  listId: 0,
  setOrgListIsEmpty: vi.fn(),
};

describe('ManageOrgRoles', () => {
  it('should render the modal with user/team name in the title', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter>
        <ManageOrgRoles
          orgListsOptions={[mockOrgListProps]}
          onManageRolesClick={vi.fn()}
          userOrTeamName="Admin User"
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Roles for Admin User')).toBeInTheDocument();
    });
  });

  it('should render manage roles and close buttons', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter>
        <ManageOrgRoles
          orgListsOptions={[mockOrgListProps]}
          onManageRolesClick={vi.fn()}
          userOrTeamName="Admin User"
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Manage roles')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
    });
  });

  it('should call onManageRolesClick when manage roles button is clicked', async () => {
    const user = userEvent.setup();
    const onManageRolesClick = vi.fn();

    server.use(
      http.get('*/role_user_assignments/*', () => HttpResponse.json({ count: 0, results: [] }))
    );

    render(
      <MemoryRouter>
        <ManageOrgRoles
          orgListsOptions={[mockOrgListProps]}
          onManageRolesClick={onManageRolesClick}
          userOrTeamName="Admin User"
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Manage roles')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Manage roles'));
    expect(onManageRolesClick).toHaveBeenCalledTimes(1);
  });
});
