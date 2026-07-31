/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { IndirectRolesModal } from './IndirectRolesModal';
import type { ITableColumn } from '@ansible/ansible-ui-framework';

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
    ModalHeader: ({ title }: { title: string; labelId?: string }) => <div>{title}</div>,
    ModalBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ModalFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

const mockView = {
  pageItems: [] as { id: number; name: string }[],
  itemCount: 0,
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
  selectedItems: [] as { id: number; name: string }[],
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

const mockTableColumns: ITableColumn<{ id: number; name: string }>[] = [
  { header: 'Name', cell: (item) => item.name },
];

describe('IndirectRolesModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={false}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
          modalTitle="Hidden Modal"
        />
      </MemoryRouter>
    );

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
  });

  it('should render modal with default title when isOpen is true', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
          username="jdoe"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Indirectly assigned roles for jdoe')).toBeInTheDocument();
  });

  it('should render with custom modal title', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
          modalTitle="Custom Title"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render modal description', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
          modalDescription="Below is a list of roles."
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Below is a list of roles.')).toBeInTheDocument();
  });

  it('should show empty state when no items', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('No indirectly assigned roles found.')).toBeInTheDocument();
  });

  it('should render default title when username is not provided', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Indirectly assigned roles for user')).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(
      <MemoryRouter>
        <IndirectRolesModal
          isOpen={true}
          onClose={vi.fn()}
          view={mockView}
          tableColumns={mockTableColumns}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});
