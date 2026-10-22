import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  acknowledgedAchievementsKey,
  readAcknowledgedAchievements,
  writeAcknowledgedAchievements,
} from './persistedAchievementState';

const USER_ID = 42;
const OTHER_USER_ID = 7;

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('acknowledgedAchievementsKey', () => {
  test('should namespace the key by user id', () => {
    expect(acknowledgedAchievementsKey(USER_ID)).not.toBe(
      acknowledgedAchievementsKey(OTHER_USER_ID)
    );
    expect(acknowledgedAchievementsKey(USER_ID)).toContain(String(USER_ID));
  });
});

describe('readAcknowledgedAchievements', () => {
  test('should return an empty list when nothing is stored', () => {
    expect(readAcknowledgedAchievements(USER_ID)).toEqual([]);
  });

  test('should round-trip what was written, in localStorage', () => {
    writeAcknowledgedAchievements(USER_ID, ['user:centurion', 'org:topTier']);

    expect(readAcknowledgedAchievements(USER_ID)).toEqual(['user:centurion', 'org:topTier']);
    expect(localStorage.getItem(acknowledgedAchievementsKey(USER_ID))).not.toBeNull();
    expect(sessionStorage.getItem(acknowledgedAchievementsKey(USER_ID))).toBeNull();
  });

  test("should not return another user's achievements", () => {
    writeAcknowledgedAchievements(OTHER_USER_ID, ['user:centurion']);

    expect(readAcknowledgedAchievements(USER_ID)).toEqual([]);
  });

  test.each([
    ['unparsable JSON', '{not json'],
    ['an object', '{"a":1}'],
    ['an array with non-strings', '["user:centurion",1]'],
    ['null', 'null'],
  ])('should return an empty list when the stored payload is %s', (_, raw) => {
    localStorage.setItem(acknowledgedAchievementsKey(USER_ID), raw);

    expect(readAcknowledgedAchievements(USER_ID)).toEqual([]);
  });

  test('should return an empty list when localStorage throws on read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(readAcknowledgedAchievements(USER_ID)).toEqual([]);
  });
});

describe('writeAcknowledgedAchievements', () => {
  test('should not throw when localStorage rejects the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => writeAcknowledgedAchievements(USER_ID, ['user:centurion'])).not.toThrow();
  });
});
