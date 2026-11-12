import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IPlatformView } from '../../../hooks/usePlatformView';
import type { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useSelectOrganization } from './useSelectOrganization';

const mockSetDialog = vi.fn();
const mockFilters = [{ key: 'name' }];
const mockColumns = [{ header: 'Name', cell: () => null }];

const minimalView = {
  page: 1,
  perPage: 10,
  itemCount: 0,
  pageItems: [],
} as unknown as IPlatformView<PlatformOrganization>;

const mockUsePlatformView = vi.fn(
  (_options: {
    url: string;
    defaultSelection?: PlatformOrganization[];
  }): IPlatformView<PlatformOrganization> => {
    return minimalView;
  }
);

let capturedSingleSelectDialogProps: Record<string, unknown> | undefined;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageDialog: (): [unknown, typeof mockSetDialog] => [undefined, mockSetDialog],
}));

vi.mock('@ansible/ansible-ui-framework/PageDialogs/SingleSelectDialog', () => ({
  SingleSelectDialog: (props: Record<string, unknown>) => {
    capturedSingleSelectDialogProps = props;
    return <div data-testid="single-select-dialog-mock" />;
  },
}));

vi.mock('./useOrganizationFilters', () => ({
  useOrganizationFilters: () => mockFilters,
}));

vi.mock('./useOrganizationColumns', () => ({
  useOrganizationColumns: () => mockColumns,
}));

vi.mock('../../../hooks/usePlatformView', () => ({
  usePlatformView: (options: unknown) =>
    mockUsePlatformView(options as Parameters<typeof mockUsePlatformView>[0]),
}));

const defaultOrg: PlatformOrganization = {
  id: 7,
  name: 'Default Org',
  description: '',
  url: '/api/gateway/v1/organizations/7/',
  created: '',
  created_by: 1,
  modified: '',
  modified_by: 1,
  managed: false,
  related: { created_by: '', modified_by: '', teams: '' },
  summary_fields: {
    created_by: { id: 1, username: 'a', first_name: '', last_name: '' },
    modified_by: { id: 1, username: 'a', first_name: '', last_name: '' },
  },
};

function wrapper({ children }: { readonly children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useSelectOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedSingleSelectDialogProps = undefined;
    mockUsePlatformView.mockImplementation(() => minimalView);
  });

  it('opens SelectOrganization dialog with expected props', () => {
    const onSelect = vi.fn();

    const { result } = renderHook(() => useSelectOrganization(), { wrapper });
    result.current(onSelect, defaultOrg);

    expect(mockSetDialog).toHaveBeenCalledTimes(1);
    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement;
    render(dialogElement);

    expect(capturedSingleSelectDialogProps).toMatchObject({
      title: 'Select organization',
      onSelect,
      defaultOrganization: defaultOrg,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      view: minimalView,
    });

    expect(mockUsePlatformView).toHaveBeenCalledWith({
      url: gatewayAPI`/organizations/`,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      disableQueryString: true,
      defaultSelection: [defaultOrg],
    });
  });

  it('does not pass defaultSelection when default organization is omitted', () => {
    const { result } = renderHook(() => useSelectOrganization(), { wrapper });
    // Runtime: callers may pass undefined before selection exists.
    result.current(vi.fn(), undefined as unknown as PlatformOrganization);

    const dialogElement = mockSetDialog.mock.calls[0][0] as React.ReactElement;
    render(dialogElement);

    expect(mockUsePlatformView).toHaveBeenCalledWith({
      url: gatewayAPI`/organizations/`,
      toolbarFilters: mockFilters,
      tableColumns: mockColumns,
      disableQueryString: true,
    });
    expect(
      (mockUsePlatformView.mock.calls[0][0] as { defaultSelection?: unknown }).defaultSelection
    ).toBeUndefined();
  });
});
