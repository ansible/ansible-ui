import { describe, expect, test } from 'vitest';
import { usePersonaView } from './usePersonaView';

describe('usePersonaView', () => {
  test('defaults to administration persona and allows updates', () => {
    const { setActivePersonaView, activePersonaViewId } = usePersonaView.getState();

    expect(activePersonaViewId).toBe('administration');

    setActivePersonaView('operator');
    expect(usePersonaView.getState().activePersonaViewId).toBe('operator');

    setActivePersonaView('administration');
  });
});
