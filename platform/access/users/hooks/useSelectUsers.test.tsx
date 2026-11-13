import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import type { PlatformUser } from '../../../interfaces/PlatformUser';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useSelectUsers } from './useSelectUsers';

const mockSetDialog = vi.fn();
const mockFilters = [{ key: 'username' }];
const mockColumns = [{ header: 'Username', cell: () => null }];

const minimalView = {
  page: 1,
  perPage: 10,
  itemCount: 0,
  pageItems: [],
} as unknown as IPlatformView<PlatformUser>;

const mockUsePlatformView = vi.fn((_options: unknown): IPlatformView<PlatformUser> => minimalView);

let capturedMultiSelectProps: Record<string, unknown> | undefined;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageDialog: (): [unknown, typeof mockSetDialog] => [undefined, mockSetDialog],
  MultiSelectDialog: (props: Record<string, unknown>) => {
    capturedMultiSelectProps = props;
    return <div data-testid="multi-select-dialog-mock" />;
  },
}));

vi.mock('./useUserColumns', () => ({
  useUsersColumns: () => mockColumns,
}));

vi.mock('./useUsersFilters', () => ({
  useUsersFilters: () => mockFilters,
}));

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: (options: unknown) => mockUsePlatformView(options),
}));

function wrapper({ children }: { readonly children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useSelectUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedMultiSelectProps = undefined;
  });

  it('opens MultiSelectDialog with gateway users view', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useSelectUsers(), { wrapper });

    result.current('Title', 'Description', 'Confirm', onSelect);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement;
    render(dialogElement);

    expect(capturedMultiSelectProps).toMatchObject({
      title: 'Title',
      description: 'Description',
      confirmText: 'Confirm',
      onSelect,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      view: minimalView,
    });

    expect(mockUsePlatformView).toHaveBeenCalledWith({
      url: gatewayAPI`/users/`,
      queryParams: { is_superuser: 'false' },
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      disableQueryString: true,
    });
  });
});
