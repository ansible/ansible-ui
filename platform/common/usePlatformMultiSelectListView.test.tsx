import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { usePlatformMultiSelectListView } from './usePlatformMultiSelectListView';

const mockSetValue = vi.fn();
const mockUsePlatformView = vi.fn();

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({ setValue: mockSetValue }),
}));

vi.mock('../hooks/usePlatformView', () => ({
  usePlatformView: (options: { defaultSelection: { id: number }[] }) => {
    mockUsePlatformView(options);
    return { selectedItems: options.defaultSelection };
  },
}));

const { mockUsePageWizard } = vi.hoisted(() => ({
  mockUsePageWizard: vi.fn(),
}));

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider', () => ({
  usePageWizard: mockUsePageWizard,
}));

describe('usePlatformMultiSelectListView', () => {
  const viewOptions = { url: '/api/gateway/v1/users/' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePageWizard.mockReturnValue({
      wizardData: {},
      stepData: {},
      activeStep: null,
    });
  });

  test('should pass wizard field selection as defaultSelection to usePlatformView', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { selectedUsers: [{ id: 1 }, { id: 2 }] },
      stepData: {},
      activeStep: null,
    });

    renderHook(() => usePlatformMultiSelectListView(viewOptions, 'selectedUsers'));

    expect(mockUsePlatformView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 1 }, { id: 2 }],
      })
    );
  });

  test('should use stepData when wizardData has no field', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {},
      stepData: { selectedRoles: [{ id: 9 }] },
      activeStep: null,
    });

    renderHook(() => usePlatformMultiSelectListView(viewOptions, 'selectedRoles'));

    expect(mockUsePlatformView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 9 }],
      })
    );
  });

  test('should read nested selection from parent step when activeStep has idOfparentStep', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {},
      stepData: {
        parentStep: { selectedTeams: [{ id: 4 }] },
      },
      activeStep: { idOfparentStep: 'parentStep' },
    });

    renderHook(() => usePlatformMultiSelectListView(viewOptions, 'selectedTeams'));

    expect(mockUsePlatformView).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultSelection: [{ id: 4 }],
      })
    );
  });

  test('should sync selected items to the form field', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { items: [{ id: 7 }] },
      stepData: {},
      activeStep: null,
    });

    renderHook(() => usePlatformMultiSelectListView(viewOptions, 'items'));

    expect(mockSetValue).toHaveBeenCalledWith('items', [{ id: 7 }]);
  });
});
