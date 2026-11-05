import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { useAwxMultiSelectListView } from './useAwxMultiSelectListView';

type TeamRow = { id: number; name: string };

const mockView = {
  selectedItems: [{ id: 1, name: 'one' }],
  pageItems: [],
};

const mockUseAwxView = vi.fn((_options?: unknown) => mockView);

const wizardState: {
  wizardData: Record<string, unknown>;
  stepData: Record<string, unknown>;
  activeStep: { idOfparentStep?: string } | null;
} = {
  wizardData: {},
  stepData: { teams: [{ id: 3, name: 'from-step' }] },
  activeStep: null,
};

vi.mock('./useAwxView', () => ({
  useAwxView: (options: unknown) => mockUseAwxView(options),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => wizardState,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { teams: [] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

const viewOptions = {
  url: '/api/v2/teams/',
  tableColumns: [{ header: 'Name', cell: (item: TeamRow) => item.name }],
};

describe('useAwxMultiSelectListView', () => {
  it('returns view and syncs selected items to form field', () => {
    wizardState.wizardData = {};
    wizardState.stepData = { teams: [{ id: 3, name: 'from-step' }] };
    wizardState.activeStep = null;
    mockUseAwxView.mockClear();

    const { result } = renderHook(() => useAwxMultiSelectListView<TeamRow>(viewOptions, 'teams'), {
      wrapper: TestWrapper,
    });

    expect(result.current.selectedItems).toEqual(mockView.selectedItems);
    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 3, name: 'from-step' }],
      })
    );
  });

  it('prefers wizardData selection over stepData', () => {
    wizardState.wizardData = { teams: [{ id: 1, name: 'from-wizard' }] };
    wizardState.stepData = { teams: [{ id: 3, name: 'from-step' }] };
    wizardState.activeStep = null;
    mockUseAwxView.mockClear();

    renderHook(() => useAwxMultiSelectListView<TeamRow>(viewOptions, 'teams'), {
      wrapper: TestWrapper,
    });

    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 1, name: 'from-wizard' }],
      })
    );
  });

  it('reads selection from parent step when nested in wizard', () => {
    wizardState.wizardData = {};
    wizardState.stepData = {
      parentStep: { teams: [{ id: 9, name: 'nested' }] },
    };
    wizardState.activeStep = { idOfparentStep: 'parentStep' };
    mockUseAwxView.mockClear();

    renderHook(() => useAwxMultiSelectListView<TeamRow>(viewOptions, 'teams'), {
      wrapper: TestWrapper,
    });

    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 9, name: 'nested' }],
      })
    );
  });

  it('uses empty default selection when wizard and step data are empty', () => {
    wizardState.wizardData = {};
    wizardState.stepData = {};
    wizardState.activeStep = null;
    mockUseAwxView.mockClear();

    renderHook(() => useAwxMultiSelectListView<TeamRow>(viewOptions, 'teams'), {
      wrapper: TestWrapper,
    });

    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [],
      })
    );
  });
});
