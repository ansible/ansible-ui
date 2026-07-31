/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SelectRolesStep } from './SelectRolesStep';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: vi.fn(() => ({
    wizardData: {
      resourceType: 'credential',
      users: [
        { id: 1, username: 'admin' },
        { id: 2, username: 'viewer' },
      ],
    },
  })),
}));

const mockView = {
  pageItems: [
    { id: 1, name: 'Role A', description: 'Role A description' },
    { id: 2, name: 'Role B', description: 'Role B description' },
  ],
  itemCount: 2,
  page: 1,
  perPage: 10,
  setPage: vi.fn(),
  setPerPage: vi.fn(),
  sort: undefined,
  setSort: vi.fn(),
  sortDirection: undefined,
  setSortDirection: vi.fn(),
  filterState: {},
  setFilterState: vi.fn(),
  clearAllFilters: vi.fn(),
  selectedItems: [],
  selectItem: vi.fn(),
  unselectItem: vi.fn(),
  isSelected: vi.fn().mockReturnValue(false),
  selectItems: vi.fn(),
  unselectAll: vi.fn(),
  keyFn: (item: { id: number }) => item.id,
  error: undefined,
  refresh: vi.fn(),
  unselectItemsAndRefresh: vi.fn(),
  isLoading: false,
};

const mockTableColumns = [{ header: 'Name', cell: (item: { name: string }) => item.name }];

describe('SelectRolesStep', () => {
  it('should render the default title', () => {
    render(
      <MemoryRouter>
        <SelectRolesStep view={mockView} tableColumns={mockTableColumns} toolbarFilters={[]} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Select roles to apply' })).toBeInTheDocument();
  });

  it('should render a custom title', () => {
    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          title="Custom Title"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Custom Title' })).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          descriptionForRoleSelection="Pick the roles"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Pick the roles')).toBeInTheDocument();
  });

  it('should render selected items from previous step', () => {
    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          fieldNameForPreviousStep="users"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('viewer')).toBeInTheDocument();
    expect(screen.getByText('Selected users')).toBeInTheDocument();
  });

  it('should render Selected roles label', () => {
    render(
      <MemoryRouter>
        <SelectRolesStep view={mockView} tableColumns={mockTableColumns} toolbarFilters={[]} />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected roles')).toBeInTheDocument();
  });

  it('should render Selected teams label for teams step', async () => {
    const mod = await import('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');
    vi.mocked(mod.usePageWizard).mockReturnValue({
      wizardData: {
        resourceType: 'credential',
        teams: [
          { id: 1, name: 'Team Alpha' },
          { id: 2, name: 'Team Beta' },
        ],
      },
    } as ReturnType<typeof mod.usePageWizard>);

    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          fieldNameForPreviousStep="teams"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected teams')).toBeInTheDocument();
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
  });

  it('should render Selected credentials label for EDA credentials', async () => {
    const mod = await import('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');
    vi.mocked(mod.usePageWizard).mockReturnValue({
      wizardData: {
        resourceType: 'eda.edacredential',
        resources: [{ id: 1, name: 'My Credential' }],
      },
    } as ReturnType<typeof mod.usePageWizard>);

    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          fieldNameForPreviousStep="resources"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected credentials')).toBeInTheDocument();
  });

  it('should render Selected projects label for EDA projects', async () => {
    const mod = await import('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');
    vi.mocked(mod.usePageWizard).mockReturnValue({
      wizardData: {
        resourceType: 'eda.project',
        resources: [{ id: 1, name: 'My Project' }],
      },
    } as ReturnType<typeof mod.usePageWizard>);

    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          fieldNameForPreviousStep="resources"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected projects')).toBeInTheDocument();
  });

  it('should render Selected rulebook activations label', async () => {
    const mod = await import('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');
    vi.mocked(mod.usePageWizard).mockReturnValue({
      wizardData: {
        resourceType: 'eda.activation',
        resources: [{ id: 1, name: 'My Activation' }],
      },
    } as ReturnType<typeof mod.usePageWizard>);

    render(
      <MemoryRouter>
        <SelectRolesStep
          view={mockView}
          tableColumns={mockTableColumns}
          toolbarFilters={[]}
          fieldNameForPreviousStep="resources"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Selected rulebook activations')).toBeInTheDocument();
  });

  it('should hide header for system resource type', async () => {
    const mod = await import('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');
    vi.mocked(mod.usePageWizard).mockReturnValue({
      wizardData: {
        resourceType: 'system',
      },
    } as ReturnType<typeof mod.usePageWizard>);

    render(
      <MemoryRouter>
        <SelectRolesStep view={mockView} tableColumns={mockTableColumns} toolbarFilters={[]} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });
});
