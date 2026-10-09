import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { useAutomationLeaderboardsView } from '../views/useAutomationLeaderboardsView';
import {
  acknowledgedAchievementsKey,
  readAcknowledgedAchievements,
  writeAcknowledgedAchievements,
} from '../utils/persistedAchievementState';

/**
 * Drives the "new achievement" alert on the Leaderboards tab.
 *
 * The persisted list holds the earned achievements the user has already dismissed the alert for.
 * On every leaderboard response it is pruned to what is still earned, so an achievement that is
 * lost and later re-earned counts as new again. The alert shows while anything earned is missing
 * from that list; dismissing it acknowledges everything currently earned.
 */
export function useNewAchievementsAlert(): { hasNewAchievements: boolean; dismiss: () => void } {
  const { earnedUserAchievements, earnedOrgAchievements, isLoading, error } =
    useAutomationLeaderboardsView();
  const { activeAwxUser } = useAwxActiveUser();
  const userId = activeAwxUser?.id;

  // User and org badge ids live in separate namespaces, so prefix them to keep them distinct.
  // Joined into a string so the effect below only re-runs when the earned set actually changes,
  // not on every render that rebuilds the arrays.
  const earnedKeysString = [
    ...earnedUserAchievements.map((id) => `user:${id}`),
    ...earnedOrgAchievements.map((id) => `org:${id}`),
  ].join(',');
  const earnedKeys = useMemo(
    () => (earnedKeysString ? earnedKeysString.split(',') : []),
    [earnedKeysString]
  );

  // While loading or after a failed request the view reports no achievements; pruning against
  // that would wipe the acknowledged list, so only sync against a real response.
  const isReady = !isLoading && !error && userId !== undefined;

  // Tagged with the user it was read for, so after a user switch the previous user's list is
  // never compared against the new user's achievements while the effect below catches up.
  const [acknowledgedState, setAcknowledgedState] = useState<{ userId: number; keys: string[] }>();
  const acknowledged =
    acknowledgedState && acknowledgedState.userId === userId ? acknowledgedState.keys : undefined;

  useEffect(() => {
    if (!isReady) return;
    const stored = readAcknowledgedAchievements(userId);
    const stillEarned = stored.filter((key) => earnedKeys.includes(key));
    // Pruning only ever removes keys, so an unchanged length means nothing to write.
    if (stillEarned.length !== stored.length) {
      writeAcknowledgedAchievements(userId, stillEarned);
    }
    setAcknowledgedState({ userId, keys: stillEarned });
  }, [isReady, userId, earnedKeys]);

  // Another tab dismissing the alert (or pruning) writes the same key; pick that up so this tab's
  // alert follows along instead of staying open until the next leaderboard response.
  useEffect(() => {
    if (userId === undefined) return;
    const onStorage = (event: StorageEvent) => {
      // `key` is null when the whole storage was cleared.
      if (event.key !== null && event.key !== acknowledgedAchievementsKey(userId)) return;
      setAcknowledgedState({ userId, keys: readAcknowledgedAchievements(userId) });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [userId]);

  const dismiss = useCallback(() => {
    if (userId === undefined) return;
    writeAcknowledgedAchievements(userId, earnedKeys);
    setAcknowledgedState({ userId, keys: earnedKeys });
  }, [userId, earnedKeys]);

  const hasNewAchievements =
    isReady && acknowledged !== undefined && earnedKeys.some((key) => !acknowledged.includes(key));

  return { hasNewAchievements, dismiss };
}
