import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useResourceTypeWizard } from './useResourceTypeWizard';

vi.mock('@ansible/ansible-ui-framework/PageWizard/PageWizardProvider');

const mockUsePageWizard = vi.mocked(usePageWizard);
const mockSetWizardData = vi.fn();
const mockSetStepData = vi.fn();

describe('useResourceTypeWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUsePageWizard.mockReturnValue({
      wizardData: {},
      setWizardData: mockSetWizardData,
      setStepData: mockSetStepData,
    } as unknown as ReturnType<typeof usePageWizard>);
  });

  it('should return undefined resourceType when no wizard data exists', () => {
    const { result } = renderHook(() => useResourceTypeWizard());
    expect(result.current.resourceType).toBeUndefined();
  });

  it('should return current resourceType from wizard data', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: { resourceType: 'awx.jobtemplate' },
      setWizardData: mockSetWizardData,
      setStepData: mockSetStepData,
    } as unknown as ReturnType<typeof usePageWizard>);

    const { result } = renderHook(() => useResourceTypeWizard());
    expect(result.current.resourceType).toBe('awx.jobtemplate');
  });

  it('should set resource type when no previous value exists', () => {
    const { result } = renderHook(() => useResourceTypeWizard());

    act(() => {
      result.current.handleResourceTypeSelection('awx.jobtemplate');
    });

    expect(mockSetWizardData).toHaveBeenCalledWith({
      resourceType: 'awx.jobtemplate',
    });
  });

  it('should preserve existing wizard data when setting same resource type', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {
        resourceType: 'awx.jobtemplate',
        someOtherData: 'preserved',
      },
      setWizardData: mockSetWizardData,
      setStepData: mockSetStepData,
    } as unknown as ReturnType<typeof usePageWizard>);

    const { result } = renderHook(() => useResourceTypeWizard());

    act(() => {
      result.current.handleResourceTypeSelection('awx.jobtemplate');
    });

    expect(mockSetWizardData).toHaveBeenCalledWith({
      resourceType: 'awx.jobtemplate',
      someOtherData: 'preserved',
    });
  });

  it('should reset wizard when resource type changes', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {
        resourceType: 'awx.jobtemplate',
        resources: ['resource1'],
      },
      setWizardData: mockSetWizardData,
      setStepData: mockSetStepData,
    } as unknown as ReturnType<typeof usePageWizard>);

    const { result } = renderHook(() => useResourceTypeWizard());

    act(() => {
      result.current.handleResourceTypeSelection('awx.inventory');
    });

    expect(mockSetWizardData).toHaveBeenCalledWith({
      resourceType: 'awx.inventory',
    });
    expect(mockSetStepData).toHaveBeenCalledWith({});
  });

  it('should clear selection and reset step data', () => {
    mockUsePageWizard.mockReturnValue({
      wizardData: {
        resourceType: 'awx.jobtemplate',
        someOtherData: 'preserved',
      },
      setWizardData: mockSetWizardData,
      setStepData: mockSetStepData,
    } as unknown as ReturnType<typeof usePageWizard>);

    const { result } = renderHook(() => useResourceTypeWizard());

    act(() => {
      result.current.handleClearSelection();
    });

    expect(mockSetWizardData).toHaveBeenCalledWith({
      resourceType: undefined,
      someOtherData: 'preserved',
    });
    expect(mockSetStepData).toHaveBeenCalledWith({});
  });
});
