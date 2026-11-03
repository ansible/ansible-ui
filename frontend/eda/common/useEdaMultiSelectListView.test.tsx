import { renderHook } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const { mockUsePageWizard, mockUseEdaView } = vi.hoisted(() => ({
  mockUsePageWizard: vi.fn(),
  mockUseEdaView: vi.fn((_options?: unknown) => ({
    selectedItems: [{ id: 3, name: 'selected' }],
  })),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));

vi.mock('./useEventDrivenView', () => ({
  useEdaView: mockUseEdaView,
}));

import { useEdaMultiSelectListView } from './useEdaMultiSelectListView';

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const methods = useForm();
    return (
      <MemoryRouter>
        <FormProvider {...methods}>{children}</FormProvider>
      </MemoryRouter>
    );
  };
}

describe('useEdaMultiSelectListView', () => {
  it('should not set a default selection when wizard and step data are empty', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {},
      stepData: {},
      activeStep: null,
    });

    renderHook(() => useEdaMultiSelectListView({ url: '/api/eda/v1/users/' }, 'users'), {
      wrapper: createWrapper(),
    });

    expect(mockUseEdaView).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/eda/v1/users/',
        defaultSelection: [],
      })
    );
  });

  it('should use wizardData when the field is present', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { users: [{ id: 1 }] },
      stepData: {},
      activeStep: null,
    });

    renderHook(() => useEdaMultiSelectListView({ url: '/api/eda/v1/users/' }, 'users'), {
      wrapper: createWrapper(),
    });

    expect(mockUseEdaView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 1 }],
      })
    );
  });

  it('should use stepData when wizardData does not contain the field', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { other: [] },
      stepData: { users: [{ id: 2 }] },
      activeStep: null,
    });

    renderHook(() => useEdaMultiSelectListView({ url: '/api/eda/v1/users/' }, 'users'), {
      wrapper: createWrapper(),
    });

    expect(mockUseEdaView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 2 }],
      })
    );
  });

  it('should use the parent step data when the active step is nested', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { other: [] },
      stepData: { parent: { users: [{ id: 9 }] } },
      activeStep: { id: 'child', idOfparentStep: 'parent' },
    });

    renderHook(() => useEdaMultiSelectListView({ url: '/api/eda/v1/users/' }, 'users'), {
      wrapper: createWrapper(),
    });

    expect(mockUseEdaView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 9 }],
      })
    );
  });

  it('should fall back to an empty selection when the field is not in wizard or step data', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { other: [] },
      stepData: { other: [] },
      activeStep: { id: 'child' },
    });

    renderHook(() => useEdaMultiSelectListView({ url: '/api/eda/v1/users/' }, 'users'), {
      wrapper: createWrapper(),
    });

    expect(mockUseEdaView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [],
      })
    );
  });
});
