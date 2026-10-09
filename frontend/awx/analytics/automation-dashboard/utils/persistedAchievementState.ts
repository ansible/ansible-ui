/**
 * localStorage key prefix under which the Leaderboards tab remembers which earned achievements
 * the user has already been alerted about. localStorage (not session) on purpose: achievements
 * the user already dismissed should not re-alert every time the browser is reopened.
 *
 * The active user's id is appended so a different user on the same browser gets their own memory.
 */
const ACKNOWLEDGED_ACHIEVEMENTS_KEY_PREFIX =
  'awx-automation-leaderboards-acknowledged-achievements';

/** localStorage key holding the acknowledged achievement keys for a given user. */
export function acknowledgedAchievementsKey(userId: number): string {
  return `${ACKNOWLEDGED_ACHIEVEMENTS_KEY_PREFIX}:${userId}`;
}

/**
 * Reads the achievement keys persisted for `userId`. Returns an empty list when nothing is
 * stored or the payload is unparsable or malformed.
 */
export function readAcknowledgedAchievements(userId: number): string[] {
  try {
    const raw = localStorage.getItem(acknowledgedAchievementsKey(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persists the achievement keys for `userId`. Best-effort: localStorage can be unavailable
 * (private browsing) or full, in which case the write is silently skipped.
 */
export function writeAcknowledgedAchievements(userId: number, achievementKeys: string[]): void {
  try {
    localStorage.setItem(acknowledgedAchievementsKey(userId), JSON.stringify(achievementKeys));
  } catch {
    // localStorage unavailable or quota exceeded — persistence is optional
  }
}
