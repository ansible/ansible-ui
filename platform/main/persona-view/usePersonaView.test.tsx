import { act } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { usePersonaView } from './usePersonaView';

describe('usePersonaView', () => {
  beforeEach(() => {
    usePersonaView.setState({ activePersonaViewId: 'administration' });
  });

  test('should default to the administration persona view', () => {
    expect(usePersonaView.getState().activePersonaViewId).toBe('administration');
  });

  test('setActivePersonaView should update activePersonaViewId', () => {
    act(() => {
      usePersonaView.getState().setActivePersonaView('operator');
    });

    expect(usePersonaView.getState().activePersonaViewId).toBe('operator');
  });
});
