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

vi.mock('./useAwxView', () => ({
  useAwxView: (options: unknown) => mockUseAwxView(options),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: () => ({
    wizardData: {},
    stepData: { teams: [{ id: 3, name: 'from-step' }] },
    activeStep: null,
  }),
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { teams: [] } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('useAwxMultiSelectListView', () => {
  it('returns view and syncs selected items to form field', () => {
    const { result } = renderHook(
      () =>
        useAwxMultiSelectListView<TeamRow>(
          {
            url: '/api/v2/teams/',
            tableColumns: [{ header: 'Name', cell: (item) => item.name }],
          },
          'teams'
        ),
      { wrapper: TestWrapper }
    );

    expect(result.current.selectedItems).toEqual(mockView.selectedItems);
    expect(mockUseAwxView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 3, name: 'from-step' }],
      })
    );
  });
});
