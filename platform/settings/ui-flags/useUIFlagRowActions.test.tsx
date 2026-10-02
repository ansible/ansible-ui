import { PageActionSelection, PageActionType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { UIFlag } from './IUIFlag';
import { getTranslatedUIFlags, useUIFlags } from './useUIFlags';
import { useUIFlagRowActions } from './useUIFlagRowActions';

describe('useUIFlagRowActions', () => {
  test('should toggle a flag enabled state when switch action fires', () => {
    useUIFlags.getState().setFlags(getTranslatedUIFlags());
    const flag = useUIFlags.getState().flags[0];

    const { result } = renderHook(() => useUIFlagRowActions());
    const switchAction = result.current.find((action) => action.type === PageActionType.Switch);

    expect(switchAction?.type).toBe(PageActionType.Switch);
    if (
      switchAction?.type === PageActionType.Switch &&
      switchAction.selection === PageActionSelection.Single
    ) {
      switchAction.onToggle(flag, !flag.enabled);
    }

    expect(useUIFlags.getState().flags[0].enabled).toBe(true);
    useUIFlags.getState().setFlags(getTranslatedUIFlags());
  });

  test('should report switch on state from flag enabled property', () => {
    const flag = {
      id: UIFlag.PersonaViewSwitcher,
      name: 'View Switcher',
      description: 'desc',
      enabled: true,
      status: 'beta' as const,
    };
    const { result } = renderHook(() => useUIFlagRowActions());
    const switchAction = result.current.find((action) => action.type === PageActionType.Switch);

    if (switchAction?.type === PageActionType.Switch) {
      expect(switchAction.isSwitchOn(flag)).toBe(true);
    }
  });
});
