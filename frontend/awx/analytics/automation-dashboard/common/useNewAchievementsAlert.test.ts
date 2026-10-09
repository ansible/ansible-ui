import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import {
  acknowledgedAchievementsKey,
  readAcknowledgedAchievements,
  writeAcknowledgedAchievements,
} from '../utils/persistedAchievementState';
import type { AutomationLeaderboardsView } from '../views/useAutomationLeaderboardsView';
import { useAutomationLeaderboardsView } from '../views/useAutomationLeaderboardsView';
import { createLeaderboardsView } from '../views/useAutomationLeaderboardsView.testUtils';
import { useNewAchievementsAlert } from './useNewAchievementsAlert';

vi.mock('../views/useAutomationLeaderboardsView', () => ({
  useAutomationLeaderboardsView: vi.fn(),
}));
vi.mock('../../../common/useAwxActiveUser', () => ({
  useAwxActiveUser: vi.fn(),
}));

const USER_ID = 42;

function mockView(overrides: Partial<AutomationLeaderboardsView>) {
  vi.mocked(useAutomationLeaderboardsView).mockReturnValue(createLeaderboardsView(overrides));
}

function renderAlertHook(initialView: Partial<AutomationLeaderboardsView>) {
  mockView(initialView);
  return renderHook(() => useNewAchievementsAlert());
}

beforeEach(() => {
  vi.mocked(useAwxActiveUser).mockReturnValue({
    activeAwxUser: { id: USER_ID },
  } as ReturnType<typeof useAwxActiveUser>);
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('useNewAchievementsAlert', () => {
  test('should show the alert on a first visit when the user already has achievements', () => {
    const { result } = renderAlertHook({ earnedUserAchievements: ['centurion'] });

    expect(result.current.hasNewAchievements).toBe(true);
  });

  test('should show the alert for a new organization achievement', () => {
    const { result } = renderAlertHook({ earnedOrgAchievements: ['topTier'] });

    expect(result.current.hasNewAchievements).toBe(true);
  });

  test('should not show the alert when nothing is earned', () => {
    const { result } = renderAlertHook({});

    expect(result.current.hasNewAchievements).toBe(false);
  });

  test('should hide the alert on dismiss and persist every earned achievement', () => {
    const { result } = renderAlertHook({
      earnedUserAchievements: ['centurion'],
      earnedOrgAchievements: ['topTier'],
    });

    act(() => result.current.dismiss());

    expect(result.current.hasNewAchievements).toBe(false);
    expect(readAcknowledgedAchievements(USER_ID)).toEqual(['user:centurion', 'org:topTier']);
  });

  test('should keep the alert hidden on a later visit when nothing new was earned', () => {
    writeAcknowledgedAchievements(USER_ID, ['user:centurion']);

    const { result } = renderAlertHook({ earnedUserAchievements: ['centurion'] });

    expect(result.current.hasNewAchievements).toBe(false);
  });

  test('should show the alert again once a new achievement arrives after a dismiss', () => {
    const { result, rerender } = renderAlertHook({ earnedUserAchievements: ['centurion'] });
    act(() => result.current.dismiss());

    mockView({ earnedUserAchievements: ['centurion'], earnedOrgAchievements: ['rising'] });
    rerender();

    expect(result.current.hasNewAchievements).toBe(true);
  });

  test('should show the alert again when a lost achievement is re-earned', () => {
    const { result, rerender } = renderAlertHook({
      earnedUserAchievements: ['centurion', 'explorer'],
    });
    act(() => result.current.dismiss());

    mockView({ earnedUserAchievements: ['explorer'] });
    rerender();
    expect(result.current.hasNewAchievements).toBe(false);
    expect(readAcknowledgedAchievements(USER_ID)).toEqual(['user:explorer']);

    mockView({ earnedUserAchievements: ['centurion', 'explorer'] });
    rerender();
    expect(result.current.hasNewAchievements).toBe(true);
  });

  test.each([
    ['loading', { isLoading: true }],
    ['the request failed', { error: new Error('boom') }],
  ])('should neither show the alert nor prune storage while %s', (_, state) => {
    writeAcknowledgedAchievements(USER_ID, ['user:centurion']);

    // The view reports no achievements while loading or after an error.
    const { result } = renderAlertHook({ ...state, earnedUserAchievements: [] });

    expect(result.current.hasNewAchievements).toBe(false);
    expect(readAcknowledgedAchievements(USER_ID)).toEqual(['user:centurion']);
  });

  test('should not show the alert or persist anything until the active user is known', () => {
    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: undefined,
    } as ReturnType<typeof useAwxActiveUser>);

    const { result } = renderAlertHook({ earnedUserAchievements: ['centurion'] });
    act(() => result.current.dismiss());

    expect(result.current.hasNewAchievements).toBe(false);
    expect(localStorage.length).toBe(0);
  });

  test("should not use another user's acknowledged achievements", () => {
    writeAcknowledgedAchievements(7, ['user:centurion']);

    const { result } = renderAlertHook({ earnedUserAchievements: ['centurion'] });

    expect(result.current.hasNewAchievements).toBe(true);
  });

  test("should not compare a new user's achievements against the previous user's list", () => {
    const OTHER_USER_ID = 7;
    // The current user never dismissed Centurion; the next user already did.
    writeAcknowledgedAchievements(OTHER_USER_ID, ['user:centurion']);
    mockView({ earnedUserAchievements: ['centurion'] });
    const renders: { userId: number | undefined; hasNewAchievements: boolean }[] = [];
    const { result, rerender } = renderHook(() => {
      const alert = useNewAchievementsAlert();
      renders.push({
        userId: useAwxActiveUser().activeAwxUser?.id,
        hasNewAchievements: alert.hasNewAchievements,
      });
      return alert;
    });
    expect(result.current.hasNewAchievements).toBe(true);

    vi.mocked(useAwxActiveUser).mockReturnValue({
      activeAwxUser: { id: OTHER_USER_ID },
    } as ReturnType<typeof useAwxActiveUser>);
    rerender();

    // Not even the render before the effect re-reads storage may flash the previous user's alert.
    const otherUserRenders = renders.filter((render) => render.userId === OTHER_USER_ID);
    expect(otherUserRenders.length).toBeGreaterThan(0);
    expect(otherUserRenders.every((render) => !render.hasNewAchievements)).toBe(true);
  });

  test('should only write to storage when pruning actually removes something', () => {
    // Hand-formatted JSON: any rewrite by the hook (JSON.stringify) would change its exact text.
    const storedRaw = '[ "user:centurion" ]';
    localStorage.setItem(acknowledgedAchievementsKey(USER_ID), storedRaw);

    const { rerender } = renderAlertHook({ earnedUserAchievements: ['centurion'] });
    mockView({ earnedUserAchievements: ['centurion', 'explorer'] });
    rerender();
    expect(localStorage.getItem(acknowledgedAchievementsKey(USER_ID))).toBe(storedRaw);

    mockView({ earnedUserAchievements: ['explorer'] });
    rerender();
    expect(localStorage.getItem(acknowledgedAchievementsKey(USER_ID))).toBe('[]');
  });

  test('should follow a dismiss made in another browser tab', () => {
    const { result } = renderAlertHook({ earnedUserAchievements: ['centurion'] });
    expect(result.current.hasNewAchievements).toBe(true);

    // What the other tab's dismiss leaves behind: the key written, plus a storage event here.
    act(() => {
      writeAcknowledgedAchievements(USER_ID, ['user:centurion']);
      window.dispatchEvent(
        new StorageEvent('storage', { key: acknowledgedAchievementsKey(USER_ID) })
      );
    });

    expect(result.current.hasNewAchievements).toBe(false);
  });
});
