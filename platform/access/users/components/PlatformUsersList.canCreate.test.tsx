/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PlatformUsersList } from './PlatformUsersList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/common-ui/PersistentFilters', () => ({
  usePersistentFilters: () => {},
}));

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: () => ({
    page: 1,
    perPage: 10,
    itemCount: 0,
    pageItems: [],
    toolbarFilters: [],
  }),
}));

vi.mock('../hooks/useUserActions', () => ({
  useUserToolbarActions: () => [],
  useUserRowActions: () => [],
}));

vi.mock('../hooks/useUserColumns', () => ({
  useUsersColumns: () => [],
}));

vi.mock('../hooks/useUsersFilters', () => ({
  useUsersFilters: () => [],
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://example.com/docs',
}));

const mockUseOptions = vi.fn();

vi.mock('@ansible/common-ui/crud/useOptions', () => ({
  useOptions: (): ReturnType<typeof mockUseOptions> => mockUseOptions(),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual<typeof import('@ansible/ansible-ui-framework')>(
    '@ansible/ansible-ui-framework'
  );
  return {
    ...actual,
    PageTable: (props: { emptyState?: ReactNode }) => (
      <div data-testid="page-table">{props.emptyState}</div>
    ),
  };
});

describe('PlatformUsersList canCreateUser branches', () => {
  it('shows read-only empty state when OPTIONS data is undefined', () => {
    mockUseOptions.mockReturnValue({ data: undefined, isLoading: false, error: undefined });

    render(
      <MemoryRouter>
        <PlatformUsersList />
      </MemoryRouter>
    );

    expect(screen.getByText('You do not have permission to create a user')).toBeInTheDocument();
  });

  it('shows read-only empty state when POST action is missing', () => {
    mockUseOptions.mockReturnValue({
      data: { actions: { GET: true } },
      isLoading: false,
      error: undefined,
    });

    render(
      <MemoryRouter>
        <PlatformUsersList />
      </MemoryRouter>
    );

    expect(screen.getByText('You do not have permission to create a user')).toBeInTheDocument();
  });
});
