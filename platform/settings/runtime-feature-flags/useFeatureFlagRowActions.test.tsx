import { PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { IFeatureFlag } from './IFeatureFlag';
import { useFeatureFlagRowActions } from './useFeatureFlagRowActions';

const openToggleModal = vi.fn();

vi.mock('./useFeatureFlagToggleModal', () => ({
  useFeatureFlagToggleModal: () => openToggleModal,
}));

function createFlag(overrides: Partial<IFeatureFlag> = {}): IFeatureFlag {
  return {
    id: 1,
    url: '/api/gateway/v1/feature_flags/1/',
    related: {},
    summary_fields: {},
    name: 'FLAG',
    ui_name: 'Test flag',
    description: 'Description',
    state: false,
    visibility: true,
    support_level: 'GENERAL_AVAILABILITY',
    toggle_type: 'runtime',
    ...overrides,
  } as IFeatureFlag;
}

describe('useFeatureFlagRowActions', () => {
  test('should open toggle modal with inverted state when switch fires', () => {
    const refresh = vi.fn();
    const flag = createFlag({ state: true });
    const { result } = renderHook(() => useFeatureFlagRowActions({ refresh }));
    const switchAction = result.current.find((action) => action.type === PageActionType.Switch);

    if (
      switchAction?.type === PageActionType.Switch &&
      switchAction.selection === PageActionSelection.Single
    ) {
      switchAction.onToggle(flag, !flag.state);
    }

    expect(openToggleModal).toHaveBeenCalledWith({
      flag,
      enable: false,
      onComplete: refresh,
    });
  });

  test('should disable install-time flags', () => {
    const { result } = renderHook(() => useFeatureFlagRowActions({ refresh: vi.fn() }));
    const switchAction = result.current.find((action) => action.type === PageActionType.Switch);
    const flag = createFlag({ toggle_type: 'install-time' });

    expect(switchAction?.type).toBe(PageActionType.Switch);
    if (switchAction?.type === PageActionType.Switch) {
      const isDisabled = switchAction.isDisabled;
      expect(typeof isDisabled).toBe('function');
      if (typeof isDisabled === 'function') {
        expect(isDisabled(flag)).toBe(
          'This is an install-time flag and cannot be toggled at runtime.'
        );
      }
    }
  });
});
