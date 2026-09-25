import { describe, expect, test } from 'vitest';
import { UIFlag } from './IUIFlag';
import { getTranslatedUIFlags, useUIFlags } from './useUIFlags';

describe('useUIFlags', () => {
  test('getTranslatedUIFlags should include the persona view switcher flag', () => {
    const flags = getTranslatedUIFlags();

    expect(flags).toHaveLength(1);
    expect(flags[0].id).toBe(UIFlag.PersonaViewSwitcher);
    expect(flags[0].enabled).toBe(false);
  });

  test('setFlags should update the in-memory flag state', () => {
    const { setFlags, flags } = useUIFlags.getState();
    const updated = flags.map((flag) => ({ ...flag, enabled: true }));

    setFlags(updated);

    expect(useUIFlags.getState().flags[0].enabled).toBe(true);

    setFlags(getTranslatedUIFlags());
  });
});
