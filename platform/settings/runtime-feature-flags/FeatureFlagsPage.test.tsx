/* eslint-disable i18next/no-literal-string */
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IFeatureFlag, SupportLevel, ToggleType } from './IFeatureFlag';
import { FeatureFlagsPage } from './FeatureFlagsPage';

interface RowAction {
  isDisabled?: (item: IFeatureFlag) => string | undefined;
  isSwitchOn?: (item: IFeatureFlag) => boolean;
}

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageHeader: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
  PageLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  PageTable: ({
    tableColumns,
    pageItems,
    rowActions,
    emptyStateTitle,
    error,
  }: {
    tableColumns: {
      id: string;
      header: string;
      cell?: (item: IFeatureFlag) => React.ReactNode;
      value?: (item: IFeatureFlag) => string;
    }[];
    pageItems: IFeatureFlag[];
    rowActions?: RowAction[];
    emptyStateTitle: string;
    error?: Error;
  }) => {
    if (error) {
      return <div data-testid="error-state">Error loading feature flags</div>;
    }
    if (!pageItems || pageItems.length === 0) {
      return <div data-testid="empty-state">{emptyStateTitle}</div>;
    }
    return (
      <table data-testid="feature-flags-table">
        <thead>
          <tr>
            {tableColumns.map((col) => (
              <th key={col.id}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageItems.map((item) => (
            <tr key={item.id} data-testid={`flag-row-${item.id}`}>
              {tableColumns.map((col) => (
                <td key={col.id} data-testid={`cell-${col.id}-${item.id}`}>
                  {col.cell ? col.cell(item) : col.value?.(item)}
                </td>
              ))}
              {rowActions && (
                <td data-testid={`row-actions-${item.id}`}>
                  {rowActions.map((action, i) => {
                    const disabled = action.isDisabled?.(item);
                    const isOn = action.isSwitchOn?.(item);
                    return (
                      <span
                        key={`action-${item.id}-${i}`}
                        data-testid={`switch-${item.id}`}
                        data-disabled={disabled ?? ''}
                        data-state={isOn ? 'on' : 'off'}
                      />
                    );
                  })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {rowActions && <div data-testid="has-row-actions" />}
      </table>
    );
  },
  useInMemoryView: <T,>({ items }: { items: T[] }) => ({
    pageItems: items,
    itemCount: items?.length ?? 0,
  }),
  PageActionType: { Switch: 'switch' },
  PageActionSelection: { Single: 'single' },
  ToolbarFilterType: { MultiText: 'multi-text', MultiSelect: 'multi-select' },
  useBulkConfirmation: () => vi.fn(),
  TextCell: ({ text }: { text: string }) => <span>{text}</span>,
  PageNotFound: () => <div data-testid="page-not-found">Page not found</div>,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../main/PlatformActiveUserProvider', () => ({
  usePlatformActiveUser: vi.fn(),
}));

vi.mock('./useRuntimeFeatureFlags', () => ({
  useRuntimeFeatureFlags: vi.fn(),
}));

vi.mock('./useRuntimeFeatureFlagsEnabled', () => ({
  useRuntimeFeatureFlagsEnabled: vi.fn(),
}));

const mockUsePlatformActiveUser = vi.mocked(
  (await import('../../main/PlatformActiveUserProvider')).usePlatformActiveUser
);
const mockUseRuntimeFeatureFlags = vi.mocked(
  (await import('./useRuntimeFeatureFlags')).useRuntimeFeatureFlags
);
const mockUseRuntimeFeatureFlagsEnabled = vi.mocked(
  (await import('./useRuntimeFeatureFlagsEnabled')).useRuntimeFeatureFlagsEnabled
);

function createFlag(overrides: Partial<IFeatureFlag> = {}): IFeatureFlag {
  return {
    id: 1,
    url: '/api/gateway/v1/feature_flags/1/',
    related: {
      activity_stream: '/api/gateway/v1/activitystream/?content_type=29&object_id=1',
      created_by: '/api/gateway/v1/users/1/',
      modified_by: '/api/gateway/v1/users/1/',
    },
    summary_fields: {
      modified_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      created_by: { id: 1, username: '_system', first_name: '', last_name: '' },
      resource: { ansible_id: 'test-id', resource_type: 'shared.aapflag' },
    },
    created: '2026-03-09T09:10:01.782315Z',
    created_by: 1,
    modified: '2026-03-09T09:10:01.782295Z',
    modified_by: 1,
    name: 'FEATURE_TEST',
    ui_name: 'Test Feature',
    condition: 'boolean',
    value: 'False',
    required: false,
    support_level: 'TECHNOLOGY_PREVIEW' as SupportLevel,
    visibility: true,
    toggle_type: 'run-time' as ToggleType,
    description: 'A test feature flag.',
    support_url: 'https://access.redhat.com/articles/test',
    labels: ['controller'],
    state: false,
    ...overrides,
  };
}

describe('FeatureFlagsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRuntimeFeatureFlagsEnabled.mockReturnValue({
      isEnabled: true,
      isLoading: false,
    });
  });

  it('should render feature flags table with data', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [
        createFlag({ id: 1, ui_name: 'Indirect Node Counting' }),
        createFlag({ id: 2, ui_name: 'EDA Analytics', support_level: 'DEVELOPER_PREVIEW' }),
      ],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('feature-flags-table')).toBeInTheDocument();
    expect(screen.getByTestId('flag-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('flag-row-2')).toBeInTheDocument();
    expect(screen.getByText('Indirect Node Counting')).toBeInTheDocument();
    expect(screen.getByText('EDA Analytics')).toBeInTheDocument();
  });

  it('should show empty state when no feature flags', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No feature flags')).toBeInTheDocument();
  });

  it('should show error state on API failure', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: new Error('Network error'),
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });

  it('should show support level labels', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [
        createFlag({ id: 1, support_level: 'TECHNOLOGY_PREVIEW' }),
        createFlag({ id: 2, support_level: 'DEVELOPER_PREVIEW' }),
      ],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByText('Technology preview')).toBeInTheDocument();
    expect(screen.getByText('Developer preview')).toBeInTheDocument();
  });

  it('should show Private label for visibility=false and state=true flags', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [createFlag({ id: 1, ui_name: 'Private Flag', visibility: false, state: true })],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Private Flag')).toBeInTheDocument();
  });

  it('should show toggle switches for superuser', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [createFlag()],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('has-row-actions')).toBeInTheDocument();
  });

  it('should not show toggle switches for auditor', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: true },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [createFlag()],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.queryByTestId('has-row-actions')).not.toBeInTheDocument();
  });

  it('should show Enabled/Disabled labels for auditor', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: true },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [createFlag({ id: 1, state: true }), createFlag({ id: 2, state: false })],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('should render page header with title and description', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByText('Feature Flags')).toBeInTheDocument();
  });

  it('should show support link when support_url is present', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [createFlag({ id: 1, support_url: 'https://access.redhat.com/articles/test' })],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    const supportCell = screen.getByTestId('cell-support_url-1');
    const link = supportCell.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://access.redhat.com/articles/test');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should show page not found when RUNTIME_FEATURE_FLAGS is disabled', () => {
    mockUseRuntimeFeatureFlagsEnabled.mockReturnValue({
      isEnabled: false,
      isLoading: false,
    });
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('page-layout')).not.toBeInTheDocument();
  });

  it('should show page not found for normal user', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('page-layout')).not.toBeInTheDocument();
  });

  it('should deny access immediately for normal user even while settings are loading', () => {
    mockUseRuntimeFeatureFlagsEnabled.mockReturnValue({
      isEnabled: false,
      isLoading: true,
    });
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: false, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [],
      isLoading: true,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
    expect(screen.queryByTestId('page-layout')).not.toBeInTheDocument();
  });

  it('should show disabled toggle with tooltip for install-time flags', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [
        createFlag({
          id: 1,
          ui_name: 'Install Time Flag',
          toggle_type: 'install-time',
          state: false,
        }),
      ],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    const toggle = screen.getByTestId('switch-1');
    expect(toggle).toHaveAttribute(
      'data-disabled',
      'This is an install-time flag and cannot be toggled at runtime.'
    );
  });

  it('should allow toggling private enabled runtime flags', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [
        createFlag({
          id: 1,
          ui_name: 'Private Enabled Flag',
          visibility: false,
          state: true,
          toggle_type: 'run-time',
        }),
      ],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    const toggle = screen.getByTestId('switch-1');
    expect(toggle).toHaveAttribute('data-disabled', '');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });

  it('should not disable toggle for runtime visible flags', () => {
    mockUsePlatformActiveUser.mockReturnValue({
      activePlatformUser: { is_superuser: true, is_platform_auditor: false },
    } as ReturnType<typeof mockUsePlatformActiveUser>);
    mockUseRuntimeFeatureFlags.mockReturnValue({
      flags: [
        createFlag({
          id: 1,
          ui_name: 'Runtime Flag',
          visibility: true,
          toggle_type: 'run-time',
          state: true,
        }),
      ],
      isLoading: false,
      error: undefined,
      refresh: vi.fn(),
    });

    render(<FeatureFlagsPage />);

    const toggle = screen.getByTestId('switch-1');
    expect(toggle).toHaveAttribute('data-disabled', '');
    expect(toggle).toHaveAttribute('data-state', 'on');
  });
});
