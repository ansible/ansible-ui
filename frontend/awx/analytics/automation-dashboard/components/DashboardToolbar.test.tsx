/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PageAlertToasterProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import type { PageToolbarProps } from '@ansible/ansible-ui-framework';
import type { IDashboardFilterSet, IJobTemplate } from '../types';
import { DashboardToolbar } from './DashboardToolbar';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Mock the async select: render a simple <select> so we can interact with it
vi.mock('@ansible/ansible-ui-framework/PageInputs/PageAsyncSingleSelect', () => ({
  PageAsyncSingleSelect: ({
    onSelect,
    placeholder,
    id,
  }: {
    onSelect: (value: string | null) => void;
    placeholder: string;
    id: string;
  }) => (
    <select
      data-testid={id}
      aria-label={placeholder}
      onChange={(e) => onSelect(e.target.value || null)}
    >
      <option value="">-- select --</option>
      <option value="1">Report A</option>
      <option value="2">Report B</option>
    </select>
  ),
}));

// Mock PageActions to verify it receives the correct actions prop
const capturedPageActionsProps: Record<string, unknown>[] = [];
vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageActions: (props: Record<string, unknown>) => {
      capturedPageActionsProps.push(props);
      return <div data-testid="page-actions" />;
    },
  };
});

// Mock useAutomationDashboardToolbarActions to keep action tests separate
const mockToolbarActions = [{ type: 'button', label: 'Test Action' }];
vi.mock('../common/useAutomationDashboardToolbarActions', () => ({
  useAutomationDashboardToolbarActions: vi.fn(() => mockToolbarActions),
}));

// Mock useFilterSetView so we control the filter set state
const mockSetFilterState = vi.fn();
const mockSetSelectedFilterSet = vi.fn();

const filterSetA: IDashboardFilterSet = {
  id: 1,
  name: 'Report A',
  filters: '{"period":["last_30_days"]}',
  is_default: false,
};

const filterSetB: IDashboardFilterSet = {
  id: 2,
  name: 'Report B',
  filters: 'INVALID_JSON',
  is_default: false,
};

const { mockUseFilterSetView } = vi.hoisted(() => ({
  mockUseFilterSetView: vi.fn(),
}));

vi.mock('../views/useFilterSetView', () => ({
  useFilterSetView: mockUseFilterSetView,
}));

function makeFilterSetViewReturn(overrides = {}) {
  return {
    value: undefined as string | undefined,
    version: 0,
    setValue: vi.fn(),
    queryOptions: vi.fn().mockResolvedValue({ options: [], remaining: 0, next: '' }),
    filterSets: [filterSetA, filterSetB],
    selectedFilterSet: undefined as IDashboardFilterSet | undefined,
    setSelectedFilterSet: mockSetSelectedFilterSet,
    removeFilterSet: vi.fn(),
    upsertFilterSet: vi.fn(),
    ...overrides,
  };
}

// ─── Wrapper ──────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <PageDialogProvider>
      <PageAlertToasterProvider>{children}</PageAlertToasterProvider>
    </PageDialogProvider>
  );
}

function buildProps(
  overrides: Partial<PageToolbarProps<IJobTemplate>> = {}
): PageToolbarProps<IJobTemplate> {
  return {
    toolbarFilters: [],
    filterState: { period: ['last_7_days'] },
    setFilterState: mockSetFilterState,
    clearAllFilters: vi.fn(),
    viewType: 'table',
    keyFn: (item: IJobTemplate) => item.id,
    disableCardView: true,
    disableListView: true,
    disableTableView: true,
    ...overrides,
  } as unknown as PageToolbarProps<IJobTemplate>;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DashboardToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedPageActionsProps.length = 0;
    mockUseFilterSetView.mockReturnValue(makeFilterSetViewReturn());
  });

  describe('rendering', () => {
    test('should render the filter set select', () => {
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      expect(screen.getByTestId('filterset-select')).toBeInTheDocument();
    });

    test('should render the PageToolbar', () => {
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      expect(screen.getByTestId('page-toolbar')).toBeInTheDocument();
    });

    test('should pass toolbarActions from useAutomationDashboardToolbarActions to PageActions', () => {
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      const lastProps: Record<string, unknown> | undefined = capturedPageActionsProps.at(-1);
      expect(lastProps?.['actions']).toBe(mockToolbarActions);
    });
  });

  describe('filter set selection', () => {
    test('should call setFilterState with parsed filters when a valid filter set is selected', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      await user.selectOptions(screen.getByTestId('filterset-select'), '1');

      expect(mockSetFilterState).toHaveBeenCalledWith({ period: ['last_30_days'] });
    });

    test('should call setSelectedFilterSet with the matching filter set on selection', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      await user.selectOptions(screen.getByTestId('filterset-select'), '1');

      expect(mockSetSelectedFilterSet).toHaveBeenCalledWith(filterSetA);
    });

    test('should fall back to default filter state when selected filter set has invalid JSON', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      await user.selectOptions(screen.getByTestId('filterset-select'), '2');

      expect(mockSetFilterState).toHaveBeenCalledWith({ period: ['last_7_days'] });
    });

    test('should reset to default filter state when selection is cleared', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} />
        </Wrapper>
      );

      // Select then deselect
      await user.selectOptions(screen.getByTestId('filterset-select'), '1');
      await user.selectOptions(screen.getByTestId('filterset-select'), '');

      // Last call should be with default filter state
      expect(mockSetFilterState).toHaveBeenLastCalledWith({ period: ['last_7_days'] });
    });
  });

  describe('registerClearCallback', () => {
    test('should register callback when registerClearCallback is provided', () => {
      const mockRegisterClearCallback = vi.fn();
      const mockSetValue = vi.fn();

      mockUseFilterSetView.mockReturnValue(makeFilterSetViewReturn({ setValue: mockSetValue }));

      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} registerClearCallback={mockRegisterClearCallback} />
        </Wrapper>
      );

      expect(mockRegisterClearCallback).toHaveBeenCalledWith(expect.any(Function));
    });

    test('should reset dropdown and selectedFilterSet when registered callback is invoked', () => {
      const mockSetValue = vi.fn();
      let capturedCallback: (() => void) | undefined;

      const mockRegisterClearCallback = vi.fn((callback: () => void) => {
        capturedCallback = callback;
      });

      mockUseFilterSetView.mockReturnValue(makeFilterSetViewReturn({ setValue: mockSetValue }));

      render(
        <Wrapper>
          <DashboardToolbar {...buildProps()} registerClearCallback={mockRegisterClearCallback} />
        </Wrapper>
      );

      // Invoke the registered callback
      expect(capturedCallback).toBeDefined();
      capturedCallback?.();

      // Verify dropdown and selected filter set are reset
      expect(mockSetValue).toHaveBeenCalledWith(undefined);
      expect(mockSetSelectedFilterSet).toHaveBeenCalledWith(undefined);
    });

    test('should not error when registerClearCallback is not provided', () => {
      expect(() => {
        render(
          <Wrapper>
            <DashboardToolbar {...buildProps()} />
          </Wrapper>
        );
      }).not.toThrow();
    });
  });
});
